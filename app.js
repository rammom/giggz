/*
	IMPORTS
*/
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const utils = require('./utils/utils');
const passport = require('passport');
const cors = require('cors');




/*
	CONFIGURE APP
*/
let app = express();
const config = (app.get('env') === 'development')
	? require('./config.json').development
	: require('./config.json').production;
app.authentication_enabled = (app.get('env') === 'development') ? config.authentication_enabled : true;
app.set('view engine', 'ejs');




/*
	CONNECT TO MONGODB
*/
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

/*
	ROUTERS
*/
const apiRouter = {
	index: require('./routes/api.route'),
	store: require('./routes/api.store.route'),
	user: require('./routes/api.user.route'),
	employee: require('./routes/api.employee.route'),
	appointment: require('./routes/api.appointment.route.js'),
}
const authRouter = require('./routes/auth.route');

/*
	ENABLE CORS
*/
var whitelist = ['https://giggz.mrammo.ca', 'https://giggz-store.mrammo.ca', 'http://localhost'];
var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	}
}
app.options("*", cors(corsOptions));

/*
	MORE MIDDLEWARE & PASSPORT STUFF
*/
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./utils/passport');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

/*
	HANDLE ROUTES
*/
app.use('/auth', authRouter);
app.use('/api', apiRouter.index);
app.use('/api/store', apiRouter.store);
app.use('/api/user', apiRouter.user);
app.use('/api/employee', apiRouter.employee);
app.use('/api/appointment', apiRouter.appointment);





/*
	HANDLE ERRORS
*/

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
