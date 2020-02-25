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

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Giggs', {useNewUrlParser:true});


const gen_user_data = () => ({
    email: "employeetest@giggs.ca",
    password: "passw0rd._!?",
    password_verify: "passw0rd._!?",
    firstname: "Nathaniel",
    lastname: "Thompson",
    phone: "1234567890",
});

const gen_store_data = () => ({
    description: "Lorem ipsum dolor sit amet, eu cum omnis eirmod argumentum, \
    dolorem senserit eloquentiam in mei, ad alienum dissentias per. \
    Inani veniam ceteros ei nam, ne quas rationibus delicatissimi vix.",
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

names = ['Arlene Gilliam',
    'Olivia Bates',
    'Jordanna Reeves',
    'Edith Graves',
    'Marina Shaffer',
    'Skylar Mays',
    'Ana Vinson',
    'Montel Love',
    'Sumaiya Corrigan',
    'Lia Hughes',
    'Kajetan Patel',
    'Yvette Bouvet',
    'Cora Dorsey',
    'Lidia Savage',
    'Ruby Hibbert',
    'Donnie Perez',
    'Markus Workman',
    'Mahira Hirst',
    'Zachery Short',
    'Aairah Hutchings',
    'Bobby Kent',
    'Jimmy John',
    'Robert McConey',
    'Abdallah Elbaba',
    'Moose Rammo'
];

store_names = [
    'Giggz Cutz',
    'Family Fruit Market',
    'OVO Barbershop',
    'McDonalds',
    "Leo's Family Diner"
];

store_addresses = [
    {
        street: '2110 Wyandotte St',
        city: 'Windsor',
        state: 'Ontario',
        country: 'Canada'
    },
    {
        street: '401 Sunset Ave',
        city: 'Windsor',
        state: 'Ontario',
        country: 'Canada'
    },
    {
        street: '2629 Fleming Crt',
        city: 'Windsor',
        state: 'Ontario',
        country: 'Canada'
    },
    {
        street: '540 Janette Ave',
        city: 'Windsor',
        state: 'Ontario',
        country: 'Canada'
    },
    {
        street: '3363 Bloomfield Rd',
        city: 'Windsor',
        state: 'Ontario',
        country: 'Canada'
    },
]

service_names = [
    'Haircut',
    'Shave',
    'Cut & Shave',
    'Brows',
    'Wax'
];

const register_route = '/auth/register';
const store_route = '/api/store';
const employee_route = '/api/store/employee';
const availability_employee_route = '/api/employee/availability';
const service_store_route = '/api/store/service';
const service_employee_route = '/api/employee/service';
const appointment_route = '/api/employee/appointment';


const main = async() => {
    
    let users = [];
    for(let i = 0; i < names.length; i++){
        registration_data = gen_user_data();
        registration_data.firstname = names[i].split(' ')[0];
        registration_data.lastname = names[i].split(' ')[1];
        registration_data.email = names[i].split(' ')[0]+"."+names[i].split(' ')[1]+"@gmail.com";
        registration_data.phone = (parseInt(registration_data.phone)+i+1).toString()
        await request.post(register_route)
            .send(registration_data)
            .then(function(res) {
                users.push(res.body.user);
            })
            .catch(err =>{
                console.log(err);
            })
    }
    
    let stores = [];
    let services = [];
    let k = 0;
    for(let i = 0; i < store_names.length; i++){
        store_data = gen_store_data();
        store_data.name = store_names[i];
        store_data.address = store_addresses[i];
        await request.post(store_route)
            .send(store_data)
            .then(function(res) {
                stores.push(res.body.store);
            })
            .catch((err) => {
                console.log(err);
            });
        
        for(let s = 0; s < service_names.length; s++){
            service_data = gen_service_data();
            service_data.name = service_names[s];
            service_data.price = (service_names[s].length*3).toString();
            service_data.length = (service_names[s].length*4).toString();
            service_data.storeid = stores[i]._id;

            await request.post(service_store_route)
                .send(service_data)
                .then(function(res) {
                    services.push(res.body.service);
                })
                .catch((err) => {
                    console.log(err);
            });
        }
        

		newU = users.splice(k,i+1);
        for (let j = 0; j < newU.length ; j++){
			let user = newU[j];
            let employee_data = gen_employee_data();
            employee_data.storeid = stores[i]._id;
            employee_data.email = user.email;

            let employee;
            await request.post(employee_route)
                .send(employee_data)
				.then(function(res) {
					console.log(res.body);
                    employee = res.body.employee;
                })
                .catch((err) => {
                    console.log(err);
				});
			await request.put(availability_employee_route)
				.send({
					employeeid: employee._id,
					hours: employee_data.hours
				})
				.then(function(res) {
					console.log(res.body);
				})
				.catch((err) => {
					console.log(err);
				});
            for(let e = 0; e < newU.length-j; e++){
                let employee_service_data = {
                    serviceid: services[i*(store_names.length) + e]._id,
                    employeeid: employee._id,
                };
    
                await request.post(service_employee_route)
                    .send(employee_service_data)
                    .then(function(res) {
                    })
                    .catch((err) => {
                        console.log(err);
                });
            }
            
        }
        k += i + 1;
        
    }
    
    process.exit(0);
}


main();