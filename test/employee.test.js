const assert = require('chai').assert;
const config = require('../config.json').development;
const url = `${config.protocol}://${config.address}:${config.port}`;
const request = require('supertest')(url);
const Availability = require("../models/Availability");
const Store = require("../models/Store");
const User = require("../models/User");
const Employee = require("../models/Employee");

const ttm = require('../utils/utils').time_to_minutes;
const mochaAsync = require('../utils/utils').mochaAsync;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Giggs', {useNewUrlParser:true});



let USER, STORE, EMPLOYEE, AVAILABILITY;



describe('Employee', () => {
    after(async () => {
        await USER.remove();
        await EMPLOYEE.remove();
        await STORE.remove();
        await Availability.findByIdAndDelete(STORE.hours);
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
    
    
	context('Registration', () => {
        const register_route = '/auth/register';
        const store_route = '/api/store';
        const employee_route = '/api/store/employee';

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
                    done(err);
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
                return done(find_error);


            let cookie;
            await request.post('/auth/login')
                .send({ email: registration_data.email, password: registration_data.password })
                .expect(200)
                .then(function(res) {
                    cookie = res.headers['set-cookie'];
                })
                .catch((err) => {
                    done(err);
                });


            let store_data = gen_store_data();
            await request.post(store_route)
                .set('Cookie', cookie)
                .send(store_data)
                .expect(200)
				.then(function(res) {
                })
                .catch((err) => {
                    done(err);
                });
            
			let store = null;
            await Store.findOne({name:store_data.name}) //Finding store
				.then( s => store = s )
                .catch( err => find_error = err );
                
            assert(store != null, `Store not created!`);
            if (find_error)
                return done(find_error);

            let employee_data = {
                storeid: store._id,
                email: registration_data.email
            };
            await request.post(employee_route)
                .set('Cookie', cookie)
                .send(employee_data)
                .expect(200)
				.then(function(res) {
                })
                .catch((err) => {
                    done(err);
                });
            let employee = null; //Finding employee
			await Employee.findOne({user:user._id}, (error,e) => {
                employee = e;
            })
            
            /*
            let availability = null; //Finding employee
			await Availability.findOne({_id:employee.hours}, (error,a) => {
                availability = a;
            })
            */
            
            USER = user;
            STORE = store;
            EMPLOYEE = employee;
            //AVAILABILITY = availability;
        })
        
    })
    
})


