const Availability = require('../models/Availability');

module.exports = { 

    status: async (req, res, next) => {
		res.status(200).send('ok 👍');
	},

	test_availability: async (req, res, next) => {
		let hours = new Availability({
			monday: [{ start: -1, end: 2 }],
			tuesday: [{ start: 1, end: 2 }, { start: 5, end: 20 }],
			wednesday: [{ start: 1, end: 2 }, { start: 1, end: 20 }],
			thursday: [{ start: 1, end: 2 }, { start: 5, end: 20 }],
			friday: [{ start: 1, end: 2 }, { start: 5, end: 20 }],
			saturday: [{ start: 1, end: 2 }, { start: 5, end: 20 }],
			sunday: [{ start: 1, end: 2 }, { start: 5, end: 20 }],
		});
		await hours.save()
			.then(() => {
				res.status(200).send('ok 👍');
			})
			.catch((err) => {
				res.status(400).send(err);
			});
	}

}