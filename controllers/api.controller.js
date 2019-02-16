const Store = require('../models/Store');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
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




/*
	store functions
*/
const store = {

	/**
	 * 		Create a new store.
	 */
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

	addEmployee: async (req, res, next) =>{
		const email = req.body.email.toUpperCase();
		const storeid = req.body.storeid;

		let find_error = null;		
		let user = null; //Checking if user exists
		await User.findOne({email})
			.then( u => user = u )
			.catch( err => find_error = err );
		if (!user){
			return sendResponse(res, "User not found");
		}
		if (user.employee){ //Makes sure user isn't already employed
			return sendResponse(res, "Failed to add employee!");
		}

		let store = null; //Checking if store exists
		await Store.findOne({_id:storeid})
			.then( s => store = s )
			.catch( err => find_error = err );
		if (!store){
			return sendResponse(res, "Store not found");
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
			new_employee.remove(); //Remove employee if store employees can't be changed
			return handleError(res, save_error, 500, "while saving employee");
		}

		return sendResponse(res, "Employee successfully created");
	}
		

}

module.exports = { 
	index,
	store,
}