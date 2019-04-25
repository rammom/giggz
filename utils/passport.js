const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const verify = require('./verify');
const utils = require('./utils');

passport.use('user-login', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
},
	async (email, password, done) => {
		email = email.toUpperCase();
		if (!verify.isEmail(email)) return done(null, false, { message: "Bad Credentials" });
		await User.findOne({ email })
			.then(async (user) => {
				if (!user)
					return done(null, false, { message: "Bad Credentials" });
				console.log(await utils.comparePassword(password, user.password));
				if (!await utils.comparePassword(password, user.password)) {
					return done(null, false, { message: "Bad Credentials" });
				}
				console.log(user);
				return done(null, user);
			})
			.catch(err => done(err));
	}
));

passport.use('employee-login', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
},
	async (email, password, done) => {
		email = email.toUpperCase();
		if (!verify.isEmail(email)) return done(null, false, { message: "Bad Credentials" });
		await User.findOne({ email })
			.then(async (user) => {
				if (!user)
					return done(null, false, { message: "Bad Credentials" });
				if (!user.employee)
					return done(null, false, { message: "Not Employee" });
				if (!await utils.comparePassword(password, user.password)) {
					return done(null, false, { message: "Bad Credentials" });
				}

				return done(null, user);
			})
			.catch(err => done(err));
	}
));





passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});