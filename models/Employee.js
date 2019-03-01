const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const roles = ["employee", "admin"]

let EmployeeSchema = new Schema({
	user:		{ type: ObjectId, ref: 'User', required: true },
    hours:		{ type: ObjectId, ref: 'Availability' },
    store:		{ type: ObjectId, ref: 'Store', required: true },
	services:	[{ type: ObjectId, ref: 'Service' }],
	appointments:	[{ type: ObjectId, ref: 'Appointment'}],
	role:		{ type: String, enum: roles, required: true },
	createdAt:	{ type: Date },
	updatedAt:	{ type: Date }
});

EmployeeSchema.pre('save', function (next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	if(!this.services){
		this.services = [];
	}
	if(!this.appointments){
		this.appointments = [];
	}
	next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);