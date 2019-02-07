const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const apiRouter = require('./routes/api');

let app = express();

const mongo = {
	ip: 'localhost',
	port: 27017,
	name: 'book',
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

app.use('/api', apiRouter);

// catch 404 
app.use(function(req, res, next) {
	res.status(404).send("I don't exist 🤷🏻‍♂️, or do I... 🤔");
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
