const assert = require('chai').assert;

const config = require('../config.json').development;
const url = `${config.protocol}://${config.address}:${config.port}`;
const request = require('supertest')(url);
const Availability = require("../models/Availability");

const ttm = require('../utils/utils').time_to_minutes;

describe('Availability', () => {
    const gen_time = () => ({
        monday: [{ start: ttm(9), end: ttm(12) },{ start: ttm(13), end: ttm(17) }],
        tuesday: [{ start: ttm(9), end: ttm(17) }],
        wednesday: [{ start: ttm(9), end: ttm(17) }],
        thursday: [{ start: ttm(9), end: ttm(17) }],
        friday: [{ start: ttm(9), end: ttm(17) }],
        saturday: [{ start: ttm(9), end: ttm(17) }],
        sunday: [{ start: ttm(9), end: ttm(18) }]
    });

    
	context('Model Functions', () => {
		it('Subset with proper arguments', function(done) {
            hours1 = gen_time();

            hours2 = gen_time();

            hours2.friday[0].start = ttm(10);
            hours2.friday[0].end = ttm(15);

            let availability1 = new Availability(hours1);

            availability1.isSubset(hours2)
                .then((res) => {
                    assert(res, `response expected to be "true", but received false.`);
                    done();
                })
                .catch((err =>{
                    done(err);
                }));
        })

        it('Subset with bad arguments', function(done) {
            hours1 = gen_time();

            hours2 = gen_time();

            hours2.friday[0].end = ttm(18);

            let availability1 = new Availability(hours1);

            availability1.isSubset(hours2)
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