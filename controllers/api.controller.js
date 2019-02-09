const Store = require('../models/Store');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const ttm = require('../utils/utils').time_to_minutes;
const handleError = require('../utils/utils').handleError;
const sendResponse = require('../utils/utils').sendResponse;
const verify = require('../utils/verify');

/*
	Check status of app
*/
const index = {
	status: async (req, res, next) => {
		return sendResponse(res, "ok 👍")
	}
}

const employee = {
	/*
	*		Create a new employee
	*/
	create: async (req, res, next) => {

		const name = req.body.name;
		const hours = req.body.hours;
		const store = req.body.store;
		const services = req.body.services;
		const role = req.body.role;
		

		// Verify non-empty data
		if (!name || !hours || !store || !services || !role){
			return res.status(400).json({
				error: `ERROR: name, address and hours are required!`
			});
		}

		//Verification of Hours data before creating Availability Object
		if (!verify.checkObjectProperties(hours, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])){
			return res.status(400).json({
				error: `ERROR: hours not formatted properly!`
			});
		}

		//Creating the Availability Object
		let availability = new Availability(hours);

		await availability.save()
			.catch((err) => {
				return res.status(500).json({
					error: `ERROR saving availability failed: ${err}`
				});
			});
		res.status(200).json({
			msg: `Store created!`
		});

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
			.catch((err) => storeError=err);

		if (storeError)
			return handleError(res, storeError, 500, "while saving store");

		return sendResponse(res, {store}, "store created");

	}


}

module.exports = { 
	index,
	store,
}