const User = require('../models/User');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('JWT_AUTH'),
	secretOrKey: process.env.SECRET_OR_KEY
}

passport.use('jwt-user', new JwtStrategy(
	JwtOptions,
	async (jwt_payload, done) => {
		console.log(jwt_payload);
		await User.findById(jwt_payload.user._id)
			.then(user => {
				if (!user) return done(null, false, { message: "Bad payload" })
				return done(null, user);
			})
			.catch(err => done(err));
	}
));

passport.use('jwt-employee', new JwtStrategy(
	JwtOptions,
	async (jwt_payload, done) => {
		await User.findById(jwt_payload.user._id)
			.then(user => {
				if (!user) return done(null, false, { message: "Bad payload" });
				if (!user.employee) return done(null, false, { message: "Bad payload" });
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