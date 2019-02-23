const assert = require('chai').assert;
const config = require('../config.json').development;
const url = `${config.protocol}://${config.address}:${config.port}`;
const request = require('supertest')(url);
const Availability = require("../models/Availability");
const Store = require("../models/Store");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const ttm = require('../utils/utils').time_to_minutes;
const mochaAsync = require('../utils/utils').mochaAsync;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Giggs', {useNewUrlParser:true});



let USER, STORE, EMPLOYEE, AVAILABILITY, APPOINTMENT;



describe('Employee', () => {
    after(async () => {
		
        await USER.remove();
        await EMPLOYEE.remove();
        await STORE.remove();
        await Availability.findByIdAndDelete(STORE.hours);
        await Availability.findByIdAndDelete(EMPLOYEE.hours);
        await Service.findByIdAndDelete(SERVICE);
        await Appointment.findByIdAndDelete(APPOINTMENT);
        
    })
    const gen_user_data = () => ({
        email: "employeetest@giggs.ca",
        password: "passw0rd._!?",
        password_verify: "passw0rd._!?",
        firstname: "Nathaniel",
        lastname: "Thompson",
        phone: "1234567890",
	});

    const gen_store_data = () => ({
		name: "Giggs Cuts",
        address: {
            street: "2110 Wyandotte St",
            city: "Windsor",
            state: "Ontario",
            country: "Canada"
        },
        hours: {
            monday: [{ start: ttm(9), end: ttm(17) }],
            tuesday: [{ start: ttm(9), end: ttm(17) }],
            wednesday: [{ start: ttm(9), end: ttm(17) }],
            thursday: [{ start: ttm(9), end: ttm(17) }],
            friday: [{ start: ttm(9), end: ttm(17) }],
            saturday: [{ start: ttm(9), end: ttm(17) }],
            sunday: [{ start: ttm(9), end: ttm(17) }],
        }
    });

    const gen_employee_data = () => ({
        role: "employee",
        hours: {
            monday: [{ start: ttm(9), end: ttm(17) }],
            tuesday: [{ start: ttm(9), end: ttm(17) }],
            wednesday: [{ start: ttm(9), end: ttm(17) }],
            thursday: [{ start: ttm(9), end: ttm(17) }],
            friday: [{ start: ttm(9), end: ttm(17) }],
            saturday: [{ start: ttm(9), end: ttm(17) }],
            sunday: [{ start: ttm(9), end: ttm(17) }],
        }
    });

    const gen_service_data = () => ({
        name: "Haircut",
        price: 25,
        length: 30
    });
    
    
	context('Registration', () => {
        const register_route = '/auth/register';
        const store_route = '/api/store';
        const employee_route = '/api/store/employee';
        const availability_employee_route = '/api/employee/availability';
        const service_store_route = '/api/store/service';
        const service_employee_route = '/api/employee/service';
        const appointment_route = '/api/employee/appointment';

		it('Creating an employee', async function() {
            /*
            A pretty thorough test: 
            It adds a brand new user to database using API
            Makes sure that user is created properly, then object is pulled up
            A cookie is created and used for authentication
            Creates a store using API and verifies its made properly
            Pulls up store from database
            Creates Employee using Store and User objects
            Pulls up employee from database
            */
            let registration_data = gen_user_data();
			await request.post(register_route)
				.send(registration_data)
				.expect(200)
				.then(function(res) {
                })
                .catch((err) => {
                    assert(false, `${err}`);
                });


            let user = null; //Finding user
            let find_error = null;
            await User.findOne({email:registration_data.email.toUpperCase()})
                .then(u => {
                    user = u;
                })
                .catch(err => find_error = err);
            
            assert(user, `User not created!`);
            if (find_error)
                assert(false, `${find_error}`);


            let cookie;
            await request.post('/auth/login')
                .send({ email: registration_data.email, password: registration_data.password })
                .expect(200)
                .then(function(res) {
                    cookie = res.headers['set-cookie'];
                })
                .catch((err) => {
                    assert(false, `${err}`);
                });


			let store_data = gen_store_data();
			let store = null;
            await request.post(store_route)
                .set('Cookie', cookie)
                .send(store_data)
                .expect(200)
				.then(function(res) {
					store = res.store;
                })
                .catch((err) => {
                    assert(false, `${err}`);
                });
            
			// let store = null;
            // await Store.findOne({slug:store_data.slug}) //Finding store
			// 	.then( s => store = s )
            //     .catch( err => find_error = err );

            assert(store != null, `Store not created!`);
            if (find_error)
                return assert(false, `${find_error}`);

            let employee_data = gen_employee_data();
            employee_data.storeid = store._id;
            employee_data.email = registration_data.email;
            await request.post(employee_route)
                .set('Cookie', cookie)
                .send(employee_data)
                .expect(200)
				.then(function(res) {
                })
                .catch((err) => {
                    assert(false, `${err}`);
                });
            let employee = null; //Finding employee
			await Employee.findOne({user:user._id}, (error,e) => {
                employee = e;
            })

            
            employee_data.employeeid = employee._id;
            let availabilityid;
            await request.put(availability_employee_route)
                .send(employee_data)
                .expect(200)
				.then(function(res) {
                    availabilityid = res.body.availabilityid;
                })
                .catch((err) => {
                    assert(false, `${err}`);
                });
            employee.hours = availabilityid;

            let haircut_data = gen_service_data();
            haircut_data.storeid = store._id;
            haircut_data.employeeid = employee._id;

            let haircutid;
            await request.post(service_store_route)
                .send(haircut_data)
                .expect(200)
				.then(function(res) {
                    haircutid = res.body.serviceid;
                })
                .catch((err) => {
                    assert(false, `${err}`);
            });

            haircut_data.serviceid = haircutid;
            await request.post(service_employee_route)
                .send(haircut_data)
                .expect(200)
                .then(function(res) {
                })
                .catch((err) => {
                    assert(false, `${err}`);
            });
            
            appointment_data = {
                serviceid:haircutid,
                storeid:store._id,
                employeeid:employee._id,
                date:"2020-02-21T12:05:00"
            };


            let appointmentid;
            await request.post(appointment_route)
                .send(appointment_data)
                .expect(200)
                .then(function(res) {
                    appointmentid = res.body.appointmentid;
                })
                .catch((err) => {
                    assert(false, `${err}`);
            });

            USER = user;
            STORE = store;
            EMPLOYEE = employee;
            SERVICE = haircutid;
            APPOINTMENT = appointmentid;
        })
        
    })
    
})


