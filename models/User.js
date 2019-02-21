const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let UserSchema = new Schema({
	email:			{ type: String, required: true },
	password:		{ type: String, required: true },
	firstname: 		{ type: String, required: true },
	lastname:		{ type: String, required: true },
	phone:			{ type: String },
	appointments:	[{ type: ObjectId, ref: 'Appointment'}],
	employee:		{ type: ObjectId, ref: 'Employee' },
	image:			{ type: String, default: "https://s3.us-east-2.amazonaws.com/giggs/default_pp.jpg", required: true },
	createdAt:		{ type: Date },
	updatedAt: 		{ type: Date }
});

UserSchema.pre('save', function (next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	next();
});

module.exports = mongoose.model('User', UserSchema);