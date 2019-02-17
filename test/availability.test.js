const assert = require('chai').assert;

const config = require('../config.json').development;
const url = `${config.protocol}://${config.address}:${config.port}`;
const request = require('supertest')(url);
const Availability = require("../models/Availability");

const ttm = require('../utils/utils').time_to_minutes;

describe('Availability', () => {

	context('Model Functions', () => {
		it('Subset with proper arguments', function(done) {
            test_hours1 = {
                monday: [{ start: ttm(9), end: ttm(17) }],
                tuesday: [{ start: ttm(9), end: ttm(17) }],
                wednesday: [{ start: ttm(9), end: ttm(17) }],
                thursday: [{ start: ttm(9), end: ttm(17) }],
                friday: [{ start: ttm(9), end: ttm(17) }],
                saturday: [{ start: ttm(9), end: ttm(17) }],
                sunday: [{ start: ttm(9), end: ttm(18) }],
            }
            test_hours2 = {
                monday: [{ start: ttm(9), end: ttm(17) }],
                tuesday: [{ start: ttm(9), end: ttm(17) }],
                wednesday: [{ start: ttm(9), end: ttm(17) }],
                thursday: [{ start: ttm(9), end: ttm(17) }],
                friday: [{ start: ttm(9), end: ttm(17) }],
                saturday: [{ start: ttm(9), end: ttm(17) }],
                sunday: [{ start: ttm(9), end: ttm(17) }],
            }
            let test_availability1 = new Availability(test_hours1);

            test_availability1.isSubset(test_hours2)
                .then((res) => {
                    assert(res, `response expected to be "true", but received false.`);
                    done();
                })
                .catch((err =>{
                    done(err);
                }));
        })

        it('Subset with bad arguments', function(done) {
            test_hours1 = {
                monday: [{ start: ttm(9), end: ttm(17) }],
                tuesday: [{ start: ttm(9), end: ttm(17) }],
                wednesday: [{ start: ttm(9), end: ttm(17) }],
                thursday: [{ start: ttm(9), end: ttm(17) }],
                friday: [{ start: ttm(9), end: ttm(17) }],
                saturday: [{ start: ttm(9), end: ttm(17) }],
                sunday: [{ start: ttm(9), end: ttm(18) }],
            }
            test_hours2 = {
                monday: [{ start: ttm(9), end: ttm(17) }],
                tuesday: [{ start: ttm(9), end: ttm(17) }],
                wednesday: [{ start: ttm(9), end: ttm(17) }],
                thursday: [{ start: ttm(9), end: ttm(17) }],
                friday: [{ start: ttm(9), end: ttm(17) }],
                saturday: [{ start: ttm(9), end: ttm(17) }],
                sunday: [{ start: ttm(7), end: ttm(17) }],
            }
            let test_availability1 = new Availability(test_hours1);

            test_availability1.isSubset(test_hours2)
                .then((res) => {
                    assert(!res, `response expected to be "false", but received true.`);
                    done();
                })
                .catch((err =>{
                    done(err);
                }));
        })
    })
})