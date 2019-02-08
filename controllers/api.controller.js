const Store = require('../models/Store');
const Availability = require('../models/Availability');
const ttm = require('../utils/utils').time_to_minutes;
const verify = require('../utils/verify');

const index = {
	status: async (req, res, next) => {
		res.status(200).send('ok 👍');
	}
}

const store = {

	/**
	 * 		Create a new store.
	 */
	create: async (req, res, next) => {

		const name = req.body.name;
		const address = req.body.address;
		const hours = req.body.hours;

		// check given data
		if (!name || !address || !hours){
			return res.status(400).json({
				error: `ERROR: name, address and hours are required!`
			});
		}

		if (!verify.checkObjectProperties(address, ['street', 'city', 'state', 'country'])){
			return res.status(400).json({
				error: `ERROR: address not formatted properly!`
			});
		}

		if (!verify.checkObjectProperties(hours, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])){
			return res.status(400).json({
				error: `ERROR: hours not formatted properly!`
			});
		}

		// create Availability
		let availability = new Availability(hours);

		await availability.save()
			.catch((err) => {
				return res.status(500).json({
					error: `ERROR saving availability failed: ${err}`
				});
			});

		let store = new Store({
			name: name,
			address: address,
			hours: availability._id,
			employees: [],
			services: []
		});

		await store.save()
			.catch((err) => {
				return res.status(500).json({
					error: `ERROR saving store failed: ${err}`
				});
			});

		res.status(200).json({
			msg: `Store created!`,
			store: store
		});

	}


}

module.exports = { 
	index,
	store,
}