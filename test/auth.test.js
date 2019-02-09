const assert = require('chai').assert;

const config = require('../config.json').development;
const url = `${config.protocol}://${config.address}:${config.port}`;
const request = require('supertest')(url);

describe('Authentication', () => {

	const gen_user_data = () => {
		return ({
			email: "test@giggs.ca",
			password: "passw0rd._!?",
			password_verify: "passw0rd._!?",
			firstname: "Nathaniel",
			lastname: "Thompson",
			phone: "1234567890",
		});
	};

	context('Registration', () => {

		const register_route = '/auth/register';
		const email2 = "test2@giggs.ca";

		it('with empty email', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.email = null;

			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'email', `wrong invalid field. expected "email" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid email', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.email = "blah0@!test.c0m";

			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'email', `wrong invalid field. expected "email" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with empty password', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.password = null;
			invalid_registration_data.password_verify = null;

			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 2, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields.includes('password'), `wrong invalid field. password not invalid`);
					assert(res.body.invalid_fields.includes('password_verify'), `wrong invalid field. password_verify not invalid`);
					done();
				});
		});

		it('with invalid (short) password', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.password = "x";
			invalid_registration_data.password_verify = "x";

			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'password', `wrong invalid field. expected "password" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (bad character) password', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.password = "passw*rd";
			invalid_registration_data.password_verify = "passw*rd";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'password', `wrong invalid field. expected "password" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with wrong password_verify', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.password_verify = "newPassw0rd._!?";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'password_verify', `wrong invalid field. expected "password_verify" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with no firstname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.firstname = null;
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'firstname', `wrong invalid field. expected "firstname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (short) firstname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.firstname = "x";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'firstname', `wrong invalid field. expected "firstname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (bad character) firstname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.firstname = "B0b";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'firstname', `wrong invalid field. expected "firstname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with no lastname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.lastname = null;
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'lastname', `wrong invalid field. expected "lastname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (short) lastname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.lastname = "x";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'lastname', `wrong invalid field. expected "lastname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (bad character) lastname', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.lastname = "B0b";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'lastname', `wrong invalid field. expected "lastname" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (short) phone', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.phone = "1234567";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'phone', `wrong invalid field. expected "phone" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		it('with invalid (bad character) phone', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.phone = "12e4567890";
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'invalid fields', `wrong error message. expected "invalid fields" but received "${res.body.msg}"`);
					assert(res.body.invalid_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.invalid_fields.length}`);
					assert(res.body.invalid_fields[0] == 'phone', `wrong invalid field. expected "phone" but received ${res.body.invalid_fields[0]}`);
					done();
				});
		});

		// user created here is persisted
		it('valid with phone', (done) => {
			let registration_data = gen_user_data();
			request.post(register_route)
				.send(registration_data)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'registered', `error registering user, body message received -> ${res.body.msg}`);
					done();
				})
		});

		// user created here is persisted
		it('valid without phone', (done) => {
			let registration_data = gen_user_data();
			registration_data.email = email2;
			registration_data.phone = null;
			request.post(register_route)
				.send(registration_data)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'registered', `error registering user, body message received -> ${res.body.msg}`);
					done();
				})
		});

		it('with duplicate fields (phone)', (done) => {
			let invalid_registration_data = gen_user_data();
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'duplicate fields', `wrong error message. expected "duplicate fields" but received "${res.body.msg}"`);
					assert(res.body.duplicate_fields.length == 2, `wrong invalid field count. expected 2 but received ${res.body.duplicate_fields.length}`);
					assert(res.body.duplicate_fields.includes('email'), `bad duplicate fields. expected "email"`);
					assert(res.body.duplicate_fields.includes('phone'), `bad duplicate fields. expected "phone"`);
					done();
				});
		});

		it('with duplicate fields (no phone)', (done) => {
			let invalid_registration_data = gen_user_data();
			invalid_registration_data.email = email2;
			invalid_registration_data.phone = null;
			request.post(register_route)
				.send(invalid_registration_data)
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'duplicate fields', `wrong error message. expected "duplicate fields" but received "${res.body.msg}"`);
					assert(res.body.duplicate_fields.length == 1, `wrong invalid field count. expected 1 but received ${res.body.duplicate_fields.length}`);
					assert(res.body.duplicate_fields.includes('email'), `bad duplicate fields. expected "email"`);
					done();
				});
		});

		it('CLEAN: delete user (no phone)', (done) => {
			let registration_data = gen_user_data();
			registration_data.email = email2;
			registration_data.phone = null;
			request.delete(register_route)
				.send({ email: registration_data.email })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'deleted', `USER NOT DELETED. error message -> ${res.body.msg}`);
					done();
				});
		});

		// 1 user is kept for following login test cases

	});

	context('Login', () => {

		const login_route = '/auth/login';
		let cookie = null;

		it('with non-existing email', (done) => {
			let user = gen_user_data();
			user.email = "wrong@email.com";
			request.post(login_route)
				.send({email: user.email, password: user.password})
				.expect(401)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.text == 'Unauthorized', `Invalid login status.  Expected "Unauthorized" but received "${res.text}"`);
					done();
				})
		});

		it('with invalid email', (done) => {
			let user = gen_user_data();
			user.email = "wr0.ng@3mail.c0m_";
			request.post(login_route)
				.send({ email: user.email, password: user.password })
				.expect(401)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.text == 'Unauthorized', `Invalid login status.  Expected "Unauthorized" but received "${res.text}"`);
					done();
				})
		});

		it('with wrong password', (done) => {
			let user = gen_user_data();
			user.password = "myPassw0rd.";
			request.post(login_route)
				.send({ email: user.email, password: user.password })
				.expect(401)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.text == 'Unauthorized', `Invalid login status.  Expected "Unauthorized" but received "${res.text}"`);
					done();
				})
		});

		it('check authentication status (not logged in)', (done) => {
			request.get('/api/authenticated')
				.expect(401)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'Unauthorized', `Invalid login status.  Expected "Unauthorized" but received "${res.body.msg}"`);
					done();
				})
		});

		it('with proper credentials', (done) => {
			let user = gen_user_data();
			request.post(login_route)
				.send({ email: user.email, password: user.password })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					cookie = res.headers['set-cookie'];
					assert(res.body.msg == 'authenticated', `Invalid login status.  Expected "authenticated" but received "${res.body.msg}"`);
					done();
				})
		});

		it('check authentication status (logged in)', (done) => {
			request.get('/api/authenticated')
				.set('Cookie', cookie)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'authenticated', `Invalid login status.  Expected "authenticated" but received "${res.body.msg}"`);
					done();
				})
		});

		it('logout', (done) => {
			request.get('/auth/logout')
				.set('Cookie', cookie)
				.expect(200)
				.end((err, res) => {
					if (err) done(err);
					assert(res.body.msg == 'logged out', `Invalid logout status.  Expected "authenticated" but received "${res.body.msg}"`)
					done();
				});
		});

		it('CLEAN: delete user (phone)', (done) => {
			let registration_data = gen_user_data();
			request.delete('/auth/register')
				.send({email: registration_data.email})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert(res.body.msg == 'deleted', `USER NOT DELETED. error message -> ${res.body.msg}`);
					done();
				});
		});

	});

});