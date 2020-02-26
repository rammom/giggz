const Store = require('../models/Store');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Availability = require('../models/Availability');
const ttm = require('../utils/utils').time_to_minutes;
const handleError = require('../utils/utils').handleError;
const sendResponse = require('../utils/utils').sendResponse;
const distance = require('../utils/utils').distance;
const verify = require('../utils/verify');

const request = require('request-promise');
const googleAPI_Key = "AIzaSyDk-ajlF-VYrDHvb1VxuY62XnHDkVwSDvk";

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

const appointment = {
	// appointment.get
	get: async (req, res, next) => {
		const appointmentid = req.params.appointmentid;
		console.log(appointmentid);
		if (!appointmentid)
			return handleError(res, null, 404);
		
		// get and populate the requested appointment
		let error = null;
		let appointment = null;
		await Appointment.findById(appointmentid)
			.populate('store')
			.populate('service')
			.populate({
				path: 'employee',
				populate: {
					path: 'user'
				}
			})
			.populate('user')
			.then(appt => appointment = appt)
			.catch(err => error = err)
		if (error) handleError(res, error, 500);
		if (!appointment) handleError(res, null, 404);

		// verify appointment belongs to current user
		if (appointment.user._id.toString() != req.user._id.toString())
			return handleError(res, null, 401);

		appointment.user = appointment.user.formatNames();
		appointment.employee.user = appointment.employee.user.formatNames();

		return sendResponse(res, {appointment});
	},
	// appointment.getUserAppointments
	getUserAppointments: async (req, res, next) => {
		let appointments = null;
		let error = null;
		await Appointment.find(
			{
				user: req.user._id, 
			}
		)
		.populate("store")
		.populate("service")
		.populate({ path: "employee", populate: { path: "user" } })
		.then(appts => appointments = appts)
		.catch(err => error = err);

		if (error) return handleError(res, error, 500);
		return sendResponse(res, {appointments});
	},
	// appointment.delete
	delete: async (req, res, next) => {
		let appointment_id = req.params.appointmentid;
		let appointment = null;
		let error = null;
		await Appointment.findById(appointment_id)
			.populate("user")
			.populate("employee")
			.then(appt => appointment = appt)
			.catch(err => error = err);
		if (error) return handleError(res, error, 500);
		if (!appointment) return sendResponse(res, {}, "invalid appointment id", 404);
		if (appointment.user._id.toString() != req.user._id.toString() && appointment.employee._id.toString() != req.user._id.toString()) return sendResponse(res, {}, "Unauthorized", 401);
		if (new Date(appointment.datetime) - new Date() <= 0) return sendResponse(res, {}, "Appointment date already passed", 400);

		appointment.user.appointments.splice(appointment.user.appointments.indexOf(appointment._id), 1);
		appointment.employee.appointments.splice(appointment.employee.appointments.indexOf(appointment._id), 1);

		await appointment.user.save()
			.catch(err => error = err);
		if (error) return handleError(res, error, 500);

		await appointment.employee.save()
			.catch(err => {
				appointment.user.appointments.push(appointment._id);
				appointment.user.save();
				error = err;
			})
		if (error) return handleError(res, error, 500);		

		await appointment.remove()
			.catch(err => {
				appointment.user.appointments.push(appointment._id);
				appointment.user.save();
				appointment.employee.appointments.push(appointment._id);
				appointment.employee.save();
				error = err;
			});
		if (error) return handleError(res, error, 500);		

		return sendResponse(res, {}, "removed", 200);
	}
}


const employee = {
	//employee.get
	get: async (req, res, next) => {
		let employeeid = req.user.employee;
		if (!employeeid)
			return handleError(res, null, 404);
		
		let employee = null;
		let error = null;
		await Employee.findById(employeeid)
			.populate('hours')
			.populate('services')
			.populate({
				path: 'appointments',
				populate: [{
					path: 'service'
				},
				{
					path: 'user'
				}]
			})
			.then(e => employee = e)
			.catch(err => error = err);

		if (error) return handleError(res, error, 500);
		if (!employee) return handleError(res, null, 404);

		employee.appointments.map(appt => {
			if (appt.user) {
				appt.user = appt.user.formatNames();
				appt.user.password = null;
			}
			return appt;
		})

		return sendResponse(res, {employee});
	},
	//employee.availability
	availability:{
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
			console.log('hjere');
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

			let appointment = new Appointment({
				user: req.user._id,
				store: employee.store._id,
				service: service._id,
				employee: employee._id,
				datetime: date
			});

			let error = null;
			await appointment.save() //Making sure appointment is saved properly
				.catch((err) => error = err);
			if(error){
				return handleError(res, error, 500, "while saving appointment");
			}
			
			let user = null;
			await User.findById(req.user._id)
				.then(usr => user = usr)
				.catch(err => error = err)
			if (error) handleError(res, error, 500);
			if (!user) sendResponse(res, {}, "not authorized", 401);

			employee.appointments.push(appointment._id);
			user.appointments.push(appointment._id);

			await employee.save() //Making sure employee is saved properly
				.catch((err) => error = err);
			if(error){
				appointment.remove();
				return handleError(res, error, 500, "while saving employee");
			}

			await user.save()
				.catch(err => error = err)
			if (error){
				appointment.remove();
				employee.appointments.splice(employee.indexOf(appointment._id), 1);
				employee.save();
				return handleError(res, error, 500);
			}

			return sendResponse(res, {appointment});
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

	//store.getBunch
	getBunch: async (req, res, next) => {
		let stores = [];
		let error = null;
		await Store.find()
			.limit(20)
			.populate({
				path: 'employees',
				populate: [{
					path: 'user'
				}]
			})
			.then(s => stores = s)
			.catch(e => error = e);
		if (error)
			return handleError(res, error, 500);
		return sendResponse(res, { stores });
	},

	//store.getByLocation
	getByLocation: async (req, res, next) => {
		let stores = [];
		let error = null;
		let lat = req.query.lat;
		let lng = req.query.lng;
		let range = req.query.range;

		if (!lat || !lng || !range){
			return handleError(res, null, 400, "Error: Latitude, longitude, and range required!");
		}

		await Store.find()
			.populate({
				path: 'employees',
				populate: [{
					path: 'user'
				}]
			})
			.then(s => stores = s)
			.catch(e => error = e);
		
		let nearbyStores = [];
		for(let i = 0; i < stores.length; i++){
			stores[i]._doc.distance = distance(lat,lng,stores[i].address.lat,stores[i].address.lng);
			if (stores[i]._doc.distance <= range){
				nearbyStores.push(stores[i]);
			}
		}
		nearbyStores.sort((a,b) => {
			return a._doc.distance - b._doc.distance;
		})

		//return subset
		if (error)
			return handleError(res, error, 500);
		return sendResponse(res, {stores:nearbyStores});
	},
	//store.getBySlug
	getBySlug: async (req, res, next) => {
		console.log('getbyslug');
		console.log(req.params.slug);
		let store = null;
		let error = null;
		if (!req.params.slug) return handleError(res, null, 400, "slug required");
		await Store.findOne({"slug": req.params.slug})
			.populate('hours')
			.populate({
				path: 'employees',
				populate: [{
					path: 'user'
				},
				{
					path: 'services'
				},
				{
					path: 'hours'
				},
				{
					path: 'appointments',
					populate: {
						path: 'service'
					}
				}]
			})
			.then(s => store = s)
			.catch(e => error = e);
		if (error)
			return handleError(res, error, 500);
		if (!store)
			return handleError(res, null, 404, "no store found");

		// format data
		store.employees.map(e => {
			e.user.firstname = e.user.firstname.substring(0,1) + e.user.firstname.substring(1).toLowerCase()
			e.user.lastname = e.user.lastname.substring(0, 1) + e.user.lastname.substring(1).toLowerCase()
			e.appointments = e.appointments.filter( appt => !appt.done() );
			return e;
		})
		console.log('returning');
		return sendResponse(res, {store});
	},
	//store.create
	create: async (req, res, next) => {
		const name = req.body.name;
		const address = req.body.address;
		const hours = req.body.hours;
		const description = req.body.description;

		let slug = req.body.name.toLowerCase();
		slug = slug.split(' ').join('-');
		slug = slug.split("'").join('');

		// check given data
		if (!name || !address || !hours)
			return handleError(res, null, 400, `ERROR: name, address and hours are required!`);
		if (!verify.hasProperties(address, ['street', 'city', 'state', 'country']))
			return handleError(res, null, 400, `ERROR: address not formatted properly!`);

		if (!verify.hasProperties(hours, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
			return handleError(res, null, 400, `ERROR: hours not formatted properly!`);			

		if (description != null){
			if(typeof description != 'string'){
				description = null;
			}
		}

		// check if slug is unique
		let stores = null;
		let error = null;
		let nextNum = "";
		await Store.find({ "slug": { $regex: new RegExp(`^${slug}[0-9]*$`, "g") } })
			.then(s => stores = s)
			.catch(e => error = e);

		if (error) return handleError(res, error, 500);
		if (stores.length > 0){
			let num = 0;
			stores.forEach(store => {
				let n = parseInt(store.slug.replace(slug,''));
				//let n = parseInt(store.slug.substring(store.slug.length - 1))
				if (n && n > num) num = n;
			});
			nextNum += num+1;
		}
		slug += nextNum;

		// create Availability
		let availability = new Availability(hours);

		let availabilityError = null;
		await availability.save()
			.catch(err => availabilityError=err);

		if (availabilityError)
			return handleError(res, availabilityError, 500, "while saving availablity");

		
		
		//Making an API request to Google to retrieve latitude and longitude (required)
		let googleError = false;
		let google_slug = address.street.split(' ').join('+') + ",+" + address.city.split(' ').join('+') + ",+" + address.state.split(' ').join('+') + ",+" + address.country.split(' ').join('+');
		
		const requestOptions = {
			url: `https://maps.googleapis.com/maps/api/geocode/json?address=${google_slug}&key=${googleAPI_Key}`,
			json: true,
		}
		
		await request(requestOptions)
			.then(res => {
				console.log(res.results[0].geometry);
				if(res.results[0].geometry == null){
					googleError = true;
					return;
				}
				address.lat = res.results[0].geometry.location.lat;
				address.lng = res.results[0].geometry.location.lng;	
			});

		
		if(googleError){
			return handleError(res, null, 400, `ERROR: Address is not valid (Google API)!`);
		}
		console.log('end');
		//console.log(address);
		
		let store = new Store({
			name: name,
			description: description,
			slug: slug,
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
			
			
			return sendResponse(res, {service},"Service successfully created",200);
		},
		//store.service.get
		get: async(req,res,next) =>{
			const storeid = req.params.storeid;
			
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
			let employee = new Employee(
				{
					user:user._id,
					store:store._id,
					role:"employee"
				}
			);
	
			await employee.save() //Making sure employee saves properly
				.catch((err) => save_error = err);
			if(save_error){
				return handleError(res, save_error, 500, "while saving employee");
			}
			

			user.employee = employee._id; //Changing user status to reflect employment
			await user.save()
				.catch((err) => save_error = err);
			if (save_error){ 
				employee.remove(); //Remove employee if user employment can't be changed
				return handleError(res, save_error, 500, "while saving employee");
			}

			store.employees.push(employee._id); //Changing store employee directory
			await store.save()
				.catch((err) => save_error = err);
			if (save_error){ 
				user.employee._id = null;
				user.save();
				employee.remove(); //Remove employee if store employees can't be changed
				return handleError(res, save_error, 500, "while saving employee");
			}


			
	
			return sendResponse(res, {employee},"Employee successfully created");
		}
	}
		

}

const user = {
	getAuthenticatedUser: (req, res, next) => {
		let user = req.user;
		user.password = null;
		sendResponse(res, {user});
	},
	getDetailedUser: async (req, res, next) => {
		console.log('get detailed user');
		console.log(req.user._id);
		if (!req.user._id) return sendResponse(res, {}, "unauthorized", 401);
		await User.findById(req.user._id)
			.populate({
				path: "appointments",
				populate: [
					{
						path: "store",
					},
					{
						path: "service"
					}
				]
			})
			.populate({
				path: "employee"
			})
			.then(user => {
				console.log(user);
				if (!user) return sendResponse(res, {}, "no user found", 404);
				user.password = null;
				return sendResponse(res, {user});
			})
			.catch(err => handleError(res, err));
	}
}

module.exports = { 
	index,
	store,
	user,
	employee,
	appointment,
}