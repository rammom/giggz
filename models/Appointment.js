const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let AppointmentSchema = new Schema({
	user:		{ type: ObjectId, ref: 'User', required: true },
	store:		{ type: ObjectId, ref: 'Store', required: true },
	service:	{ type: ObjectId, ref: 'Service', required: true },
	employee:	{ type: ObjectId, ref: 'Employee', required: true},
	datetime:	{ type: Date, required: true },
	createdAt:	{ type: Date },
	updatedAt:	{ type: Date }
});

AppointmentSchema.methods.done = function(){
	let date = new Date();
	if (this.datetime < date) return true;
	return false;
}

AppointmentSchema.pre('save', function (next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);