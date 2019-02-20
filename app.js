const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require("redis");
const redis_client = redis.createClient();
const bodyParser = require('body-parser');
const User = require('./models/User');
const utils = require('./utils/utils');
const verify = require('./utils/verify');

redis_client.on('connect', () => {
	if (app.get('env') === 'development') console.log(`* Connected to redis client`);
});
redis_client.on('error', (err) => {
	if (app.get('env') === 'development') console.log(`* Failed to connect to redis client ${err}`);
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
	},
	async (email, password, done) => {
		email = email.toUpperCase();
		if (!verify.isEmail(email)) return done(null, false, { message: "Bad Credentials" });
		await User.findOne({email})
			.then(async (user) => {
				if (!user)
					return done(null, false, { message: "Bad Credentials" });
				if (!await utils.comparePassword(password, user.password)){
					return done(null, false, { message: "Bad Credentials" });
				}
				return done(null, user);
			})
			.catch(err => done(err));
	}
));

const apiRouter = {
	index: require('./routes/api.route'),
	store: require('./routes/api.store.route'),
	user: require('./routes/api.user.route'),
	employee: require('./routes/api.employee.route'),
}
const authRouter = require('./routes/auth.route');

let app = express();
const config = (app.get('env') === 'development') 	
				? require('./config.json').development
				: require('./config.json').production;
app.authentication_enabled = (app.get('env') === 'development') ? config.authentication_enabled : true;

app.set('view engine', 'ejs');

const mongo = {
	ip: config.db_address,
	port: config.db_port,
	name: config.db_name,
}
mongoose.connect(`mongodb://${mongo.ip}:${mongo.port}/${mongo.name}`, { useNewUrlParser: true })
		.then(
			() => { if (app.get('env') === 'development') console.log(`* Connected to mongodb database (${mongo.name}) at ${mongo.ip}:${mongo.port}`); },	// success
			() => { if (app.get('env') === 'development') console.log(`* Failed to connect to mongodb database (${mongo.name}) at ${mongo.ip}:${mongo.port}`); } 	// fail
		);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	store: new RedisStore({ redis_client }),
	secret: config.session_secret, 
	resave: true,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

app.use('/auth', authRouter);
app.use('/api', apiRouter.index);
app.use('/api/store', apiRouter.store);
app.use('/api/user', apiRouter.user);
app.use('/api/employee', apiRouter.employee);
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> conflict
=======

>>>>>>> 9fe8b7b4663c9a1b5991442349a4a88e43c44f56

// catch 404 
app.use(function(req, res, next) {
	res.status(404).send("I don't exist 🤷🏻‍♂️, or do I... 🤔");
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	const msg = (typeof err == 'string') ? err : null;
	utils.handleError(res, err, 401, msg);
});

module.exports = app;
