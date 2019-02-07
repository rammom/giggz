const assert = require('chai').assert;

const Store = require('../models/Store');
const Service = require('../models/Service');
const Employee = require('../models/Employee');
const Availability = require('../models/Availability');
const Appointment = require('../models/Store');
const User = require('../models/User');

const ttm = require('../utils/utils').time_to_minutes;

describe('Store', () => {

	context('create', () => {
		it('with proper arguments', async (done) => {
			// create availability
			let hours = new Availability({
				monday:		[{ start: ttm(8), end: ttm(15) }],
				tuesday:	[{ start: ttm(8), end: ttm(15) }],
				wednesday:	[{ start: ttm(8), end: ttm(15) }],
				thursday:	[{ start: ttm(8), end: ttm(15) }],
				friday:		[{ start: ttm(8), end: ttm(15) }],
				saturday:	[{ start: ttm(8), end: ttm(15) }],
				sunday:		[{ start: ttm(8), end: ttm(15) }],
			});

			hours.save();

			// // create the store
			// let store = new Store({
			// 	name: "test store",
			// 	address: {
			// 		street: "2629 Fleming Crt",
			// 		city: "Windsor",
			// 		state: "Ontario",
			// 		country: "Canada"
			// 	},
			// 	hours: hours._id,
			// 	employees: [],
			// 	services: [],
			// 	createdAt: null,
			// 	updatedAt: null
			// });

			// await store.save()
			// 	.then(() => {
			// 		done();
			// 	})
			// 	.catch((err) => {
			// 		assert(!err, `An error occured while saving store! => ${err}`);
			// 	});

		});
	});

});