const Store = require('../models/Store');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Availability = require('../models/Availability');
const ttm = require('../utils/utils').time_to_minutes;
const handleError = require('../utils/utils').handleError;
const sendResponse = require('../utils/utils').sendResponse;
const verify = require('../utils/verify');

/*
	Check status of app
*/
const index = {
	status: (req, res, next) => {
		return sendResponse(res, "ok");
	},
	authenticated: (req, res, next) => {
		return sendResponse(res, "authenticated");
	}
}


const employee = {
	//employee.availability
	availability:{
		//employee.availability.get
		get: async(req,res,next) =>{
			const employeeid = req.body.employeeid;
			
			if(!employeeid){
				return handleError(res,null,400,"ERROR: employee id required.");
			}
			let find_error = null;
			let employee = null; //Checking if employee exists
			await Employee.findById(employeeid)
				.then( e => {
					employee = e
				 })
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			const availability_id = employee.hours;
			if (!availability_id){
				return sendResponse(res,null,"null", 200);
			}

			let availability = null;
			await Availability.findById(availability_id)
				.then( a => {
					availability = a
				 })
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding availability");
			}

			return sendResponse(res,{availability});
			

		},
		//employee.availability.update
		update: async(req, res, next) =>{
			const employeeid = req.body.employeeid;
			const hours = req.body.hours;
			
			if(!employeeid || !hours){
				return handleError(res,null,400,"ERROR: employee id and availability hours required.");
			}

			if (!verify.hasProperties(hours, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
				return handleError(res, null, 400, `ERROR: hours not formatted properly!`);	
			
			let find_error = null;
			let employee = null; //Checking if employee exists
			await Employee.findById(employeeid)
				.populate({
					path: 'store',
					populate: {path: 'hours'}
				})
				.then( e => employee = e )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}
			if(!employee.store.hours.isSubset(hours)){ //Makes sure availability fits store's
				return sendResponse(res, "Availability outside store hours!",400);
			}
			//Creating Availability
			let availability = new Availability(hours);
			let availability_error = null;
			await availability.save()
				.catch(err => availability_error=err);
			if (availability_error)
				return handleError(res, availability_error, 500, "while saving availablity");

			let save_error = null;
			employee.hours = availability; //Updating availability
			await employee.save()
				.catch((err) => save_error = err);
			if (save_error){ 
				availability.remove();
				return handleError(res, save_error, 500, "while updating employee availability");
			}

			return sendResponse(res,{availabilityid:availability._id},"Availability updated successfully");
		}
	},
	//employee.service
	service:{
		//employee.service.add
		add: async(req, res, next) => {
			const employeeid = req.body.employeeid;
			const serviceid = req.body.serviceid;


			if (!employeeid || !serviceid)
			return handleError(res, null, 400, `ERROR: Employee ID and Service ID is required!`);

			let employee = null; //Checking if employee exists
			let find_error = null;
			await Employee.findById(employeeid)
				.then( e => employee = e )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			//Make sure service doesn't already exist
			if(employee.services){
				if(employee.services.map(sid=>sid.toString()).includes(serviceid)){
					return handleError(res,null,400,'ERROR: Service already exists!');
				}
			}
			
			let service = null;
			await Service.findById(serviceid)
				.then( s => service = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding service");
			}
			if (!service){
				return sendResponse(res, "Service not found",404);
			}
			if(!service.store.equals(employee.store)){
				return handleError(res,null,400,'ERROR: Stores do not match!');
			}

			employee.services.push(service);
			let save_error = null;
			await employee.save() //Making sure employee saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving service to the employee");
			}
			
			return sendResponse(res, "Service successfully created");
		
		},
		//employee.service.get
		get: async(req,res,next) =>{
			const employeeid = req.body.employeeid;
			
			if(!employeeid){
				return handleError(res,null,400,"ERROR: employee id required.");
			}

			let find_error = null;
			let employee = null; //Checking if employee exists
			await Employee.findById(employeeid)
				.populate("services")
				.then( e => {
					employee = e
				 })
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}

			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			return sendResponse(res,{services: employee.services},400);
		},
		//employee.service.delete
		delete: async(req,res,next) =>{
			const employeeid = req.body.employeeid;
			const serviceid = req.body.serviceid;


			if (!employeeid || !serviceid)
			return handleError(res, null, 400, `ERROR: Employee ID and Service ID is required!`);

			let employee = null; //Checking if employee exists
			let find_error = null;
			await Employee.findById(employeeid)
				.then( e => employee = e )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			//Removing a service if the serviceid matches
			let deleted = null;
			if(employee.services){
				if(employee.services.map(sid=>sid.toString()).includes(serviceid)){
					employee.services.remove(serviceid);
					deleted = true;
				}
			}
			
			if(!deleted){
				return sendResponse(res, "Employee does not offer this service",404);
			}
	

			let save_error = null;
			await employee.save() //Making sure employee saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving employee services");
			}
			
			return sendResponse(res, "Service successfully deleted");
		}
	},
	//employee.appointment
	appointment:{
		//employee.appointment.add
		add: async(req,res,next) => {
			let employeeid = req.body.employeeid;
			let serviceid = req.body.serviceid;
			let date = req.body.date;
			let now = new Date();

			if (!employeeid || !serviceid || !date)
			return handleError(res, null, 400, `ERROR: Employee ID, Service ID, and date is required!`);

			date = new Date(date);
			if (!(date instanceof Date) || isNaN(date) || date < now){
				return handleError(res, null, 400, `ERROR: Invalid date!`);
			}
			
			let employee = null; //Checking if employee exists
			let find_error = null;
			await Employee.findById(employeeid)
				.populate('hours')
				.populate({
					path: 'appointments',
					populate: {path: 'service'}
				})
				.then( e => employee = e )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			let service = null;
			await Service.findById(serviceid)
				.then( s => service = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding service");
			}
			if (!service){
				return sendResponse(res, "Service not found",404);
			}

			// Indexing starts at sunday for Date.getDay (I dont know why...)
			const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
			
			// Converting the datetime to an Availability-like format in order to compare
			// Comparing is really easy this way using the '.isSubset' method in Availability
			appointment_start = ttm(date.getHours(),date.getMinutes());
			appointment_end = appointment_start + service.length;
			slot = {start:appointment_start,end:appointment_end};
			appointment_slot = {
				monday: [],
				tuesday: [],	
				wednesday: [],
				thursday: [],
				friday: [],
				saturday: [],
				sunday: []
			};
			//Pushing the slot into the correct date before it can be compared with the employee availability
			appointment_slot[days[date.getDay()]].push(slot);

			// Ensures that the appointment is within employee's availability
			if(!(await employee.hours.isSubset(appointment_slot))){
				return handleError(res, null, 400, `ERROR: Appointment is outside of Employee hours!`);
			}


			
			let conflict = false;
			employee.appointments.forEach((a) => {
				a_start = ttm(a.datetime.getHours(),a.datetime.getMinutes());
				a_end = a_start + a.service.length;

				if(a.datetime.getDate() != date.getDate() || a.datetime.getMonth() != date.getMonth() || a.datetime.getFullYear() != date.getFullYear()){
					return;
				}
				
				if(appointment_start >= a_start && appointment_start < a_end){
					conflict = true;
					return;
				}
				if(appointment_end > a_start && appointment_end <= a_end){
					conflict = true;
					return;
				}

				if(appointment_start <= a_start && appointment_end >= a_end){
					conflict = true;
					return;
				}

			})
			
			if (conflict){
				return handleError(res, null, 400, `ERROR: Appointment conflict!`);
			}

			appointment = new Appointment({
				store: employee.store._id,
				service: service._id,
				employee: employee._id,
				datetime: date
			});


			let save_error = null;
			await appointment.save() //Making sure appointment is saved properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving appointment");
			}
			
			employee.appointments.push(appointment);

			await employee.save() //Making sure employee is saved properly
				.catch((err) => save_error = err);
			if(save_error){
				appointment.delete();
				return handleError(res, save_error, 500, "while saving employee");
			}

			return sendResponse(res,{appointmentid:appointment._id},"Appointment successfully added!");
		},
		//employee.appointment.get
		get: async(req,res,next) =>{
			const employeeid = req.body.employeeid;
			
			if(!employeeid){
				return handleError(res,null,400,"ERROR: employee id required.");
			}

			let find_error = null;
			let employee = null; //Checking if employee exists
			await Employee.findById(employeeid)
				.populate("appointments")
				.then( e => {
					employee = e
				 })
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}

			if (!employee){
				return sendResponse(res, "Employee not found");
			}

			return sendResponse(res,{appointments: employee.appointments},200);
		},
		//employee.appointment.update
		update: async(req,res,next) => {
			let serviceid = req.body.serviceid;
			let appointmentid = req.body.appointmentid;
			let date = req.body.date;
			let now = new Date();

			if (!serviceid || !date || !appointmentid)
			return handleError(res, null, 400, `ERROR: Service ID, Appointment ID, and date is required!`);

			date = new Date(date);
			if (!(date instanceof Date) || isNaN(date) || date < now){
				return handleError(res, null, 400, `ERROR: Invalid date!`);
			}
			
			let appointment = null;
			let find_error = null;
			await Appointment.findById(appointmentid)
				.then( a => appointment = a )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding appointment");
			}
			if (!appointment){
				return sendResponse(res, "Appointment not found",404);
			}

			let employeeid = appointment.employee;
			let employee = null; //Checking if employee exists
			await Employee.findById(employeeid)
				.populate('hours')
				.populate({
					path: 'appointments',
					populate: {path: 'service'}
				})
				.then( e => employee = e )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding employee");
			}
			if (!employee){
				return sendResponse(res, "Employee not found",404);
			}

			let service = null;
			await Service.findById(serviceid)
				.then( s => service = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding service");
			}
			if (!service){
				return sendResponse(res, "Service not found",404);
			}

			const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
			

			appointment_start = ttm(date.getHours(),date.getMinutes());
			appointment_end = appointment_start + service.length;
			slot = {start:appointment_start,end:appointment_end};
			appointment_slot = {
				monday: [],
				tuesday: [],	
				wednesday: [],
				thursday: [],
				friday: [],
				saturday: [],
				sunday: []
			};
			//Pushing the slot into the correct date before it can be compared with the employee availability
			appointment_slot[days[date.getDay()]].push(slot);

			// Ensures that the appointment is within employee's availability
			if(!(await employee.hours.isSubset(appointment_slot))){
				return handleError(res, null, 400, `ERROR: Appointment is outside of Employee hours!`);
			}


			
			let conflict = false;
			employee.appointments.forEach((a) => {

				if(a.equals(appointment)){
					return;
				}
				if(a.datetime.getDate() != date.getDate() || a.datetime.getMonth() != date.getMonth() || a.datetime.getDate() != date.getDate()){
					return;
				}
				a_start = ttm(a.datetime.getHours(),a.datetime.getMinutes());
				a_end = a_start + a.service.length;

				if(appointment_start >= a_start && appointment_start < a_end){
					conflict = true;
					return;
				}
				if(appointment_end > a_start && appointment_end <= a_end){
					conflict = true;
					return;
				}

				if(appointment_start <= a_start && appointment_end >= a_end){
					conflict = true;
					return;
				}

			})
			
			if (conflict){
				return handleError(res, null, 400, `ERROR: Appointment conflict!`);
			}



			appointment.datetime = date;
			appointment.service = service._id;

			let save_error = null;
			await appointment.save() //Making sure appointment is saved properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving appointment");
			}
			
			return sendResponse(res,"Appointment successfully updated!");
		}
	}
}

/*
	store functions
*/
const store = {

	/**
	 * 		Create a new store.
	 */
	//store.create
	create: async (req, res, next) => {

		const name = req.body.name;
		const address = req.body.address;
		const hours = req.body.hours;

		// check given data
		if (!name || !address || !hours)
			return handleError(res, null, 400, `ERROR: name, address and hours are required!`);

		if (!verify.hasProperties(address, ['street', 'city', 'state', 'country']))
			return handleError(res, null, 400, `ERROR: address not formatted properly!`);

		if (!verify.hasProperties(hours, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
			return handleError(res, null, 400, `ERROR: hours not formatted properly!`);			

		// create Availability
		let availability = new Availability(hours);

		let availabilityError = null;
		await availability.save()
			.catch(err => availabilityError=err);

		if (availabilityError)
			return handleError(res, availabilityError, 500, "while saving availablity");

		let store = new Store({
			name: name,
			address: address,
			hours: availability._id,
			employees: [],
			services: []
		});

		let storeError = null;
		await store.save()
			.catch(err => storeError=err);

		if (storeError)
			return handleError(res, storeError, 500, "while saving store");

		return sendResponse(res, {store}, "store created");

	},
	//store.service
	service:{
		//store.service.add
		add: async(req, res, next) =>{
			const name = req.body.name;
			const price = req.body.price;
			const length = req.body.length;
			const storeid = req.body.storeid;

			if (!name || !price || !length || !storeid)
			return handleError(res, null, 400, `ERROR: name, price and length, and Store ID is required!`);

			let store = null; //Checking if store exists
			let find_error = null;
			await Store.findById(storeid)
				.populate("services")
				.then( s => store = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding store");
			}
			if (!store){
				return sendResponse(res, "Store not found",404);
			}

			//Make sure service doesn't already exist
			if(store.services){
				for (let i = 0; i < store.services.length; i++){
					if (name == store.services[i].name){
						return handleError(res, null, 400, `ERROR: Service with the same name exists!`);
					}
				}
			}
			

			const service = new Service({
				name:name,
				store:store._id,
				price:price,
				length:length
			});

			let save_error = null;
			await service.save() //Making sure service saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving service");
			}

			store.services.push(service);
			await store.save() //Making sure store saves properly
				.catch((err) => save_error = err);
			if(save_error){
				service.remove(); //Removing service data on failure
				return handleError(res, save_error, 500, "while saving service to the store");
			}
			
			
			return sendResponse(res, {serviceid: service._id},"Service successfully created",200);
		},
		//store.service.get
		get: async(req,res,next) =>{
			const storeid = req.body.storeid;
			
			if(!storeid){
				return handleError(res,null,400,"ERROR: store id required.");
			}

			let find_error = null;
			let store = null; //Checking if store exists
			await Store.findById(storeid)
				.populate("services")
				.then( s => {
					store = s
				 })
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding store");
			}

			if (!store){
				return sendResponse(res, "Store not found");
			}

			return sendResponse(res,{services: store.services},400);
		},
		//store.service.delete
		delete: async(req,res,next) =>{
			const storeid = req.body.storeid;
			const serviceid = req.body.serviceid;


			if (!storeid || !serviceid)
			return handleError(res, null, 400, `ERROR: Store ID and Service ID is required!`);

			let store = null; //Checking if store exists
			let find_error = null;
			await Store.findById(storeid)
				.populate('employees')
				.then( s => store = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding store");
			}

			if (!store){
				return sendResponse(res, "Store not found",404);
			}

			if (!store.services){
				return sendResponse(res, "Store has no services",404);
			}

			if(!store.services.map(sid=>sid.toString()).includes(serviceid)){
				return sendResponse(res, "Store does not offer this service",404);
			}


			let service = null;
			await Service.findByIdAndDelete(serviceid)
				.then( s => service = s )
				.catch( err => find_error = err );
			if (!service){
				return sendResponse(res, "Service not found",404);
			}

			//Removing a service if the serviceid matches

			let save_error = null;

			if(store.employees){
				store.employees.forEach(async emp =>{
					if(emp.services.map(sid=>sid.toString()).includes(serviceid)){
						await emp.services.remove(serviceid);
						await emp.save() //Making sure employee saves properly
							.catch((err) => save_error = err);
					}
				})
			}

			if(save_error){
				return handleError(res, save_error, 500, "while saving employee services");
			}

			await store.services.remove(serviceid);
			await store.save() //Making sure store saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving store");
			}
			await service.remove();

			return sendResponse(res, "Service successfully deleted");
		}
	},
	//store.employee
	employee: {
		//store.employee.add
		add: async (req, res, next) =>{
			const email = req.body.email.toUpperCase();
			const storeid = req.body.storeid;
	
			let find_error = null;		
			let user = null; //Checking if user exists
			await User.findOne({email})
				.then( u => user = u )
				.catch( err => find_error = err );
			if (!user){
				return sendResponse(res, "User not found",400);
			}
			if (user.employee){ //Makes sure user isn't already employed
				return sendResponse(res, "Failed to add employee!");
			}
	
			let store = null; //Checking if store exists
			await Store.findById(storeid)
				.then( s => store = s )
				.catch( err => find_error = err );
			if (find_error){
				return handleError(res, find_error, 500, "while finding store");
			}
			if (!store){
				return sendResponse(res, "Store not found",404);
			}
	
			let save_error = null; //Creating Employee
			let new_employee = new Employee(
				{
					user:user._id,
					store:store._id,
					role:"employee"
				}
			);
	
			await new_employee.save() //Making sure employee saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving employee");
			}
			

			user.employee = new_employee._id; //Changing user status to reflect employment
			await user.save()
				.catch((err) => save_error = err);
			if (save_error){ 
				new_employee.remove(); //Remove employee if user employment can't be changed
				return handleError(res, save_error, 500, "while saving employee");
			}

			store.employees.push(new_employee._id); //Changing store employee directory
			await store.save()
				.catch((err) => save_error = err);
			if (save_error){ 
				user.employee._id = null;
				user.save();
				new_employee.remove(); //Remove employee if store employees can't be changed
				return handleError(res, save_error, 500, "while saving employee");
			}


			
	
			return sendResponse(res, "Employee successfully created");
		}
	}
		

}

const user = {
	getAuthenticatedUser: async (req, res, next) => {
		let user = req.user;
		user.password = null;
		sendResponse(res, {user});
	}
}

module.exports = { 
	index,
	store,
	user,
	employee,
}