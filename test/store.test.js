// const assert = require('chai').assert;

// const config = require('../config.json').development;
// const url = `${config.protocol}://${config.address}:${config.port}`;
// const request = require('supertest')(url);

// const ttm = require('../utils/utils').time_to_minutes;

// describe('Store', () => {

// 	context('create', () => {
// 		it('with proper arguments', function(done) {
			
// 			let store_data = {
// 				name: "Giggs Cuts",
// 				address: {
// 					street: "2110 Wyandotte St",
// 					city: "Windsor",
// 					state: "Ontario",
// 					country: "Canada"
// 				},
// 				hours: {
// 					monday: [{ start: ttm(9), end: ttm(17) }],
// 					tuesday: [{ start: ttm(9), end: ttm(17) }],
// 					wednesday: [{ start: ttm(9), end: ttm(17) }],
// 					thursday: [{ start: ttm(9), end: ttm(17) }],
// 					friday: [{ start: ttm(9), end: ttm(17) }],
// 					saturday: [{ start: ttm(9), end: ttm(17) }],
// 					sunday: [{ start: ttm(9), end: ttm(17) }],
// 				}
// 			}

// 			request.post('/api/store')
// 				.send(store_data)
// 				.expect(200)
// 				.end(function(err, res){
// 					if (err) return done(err);
// 					console.log(res.body);
// 					done();
// 				});

// 		});
// 	});

// });