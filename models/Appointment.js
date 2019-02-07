const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let AppointmentSchema = new Schema({
	user:		{ type: ObjectId, ref: 'User' },
	store:		{ type: ObjectId, ref: 'Store', required: true },
	service:	{ type: ObjectId, ref: 'Service', required: true },
	employee:	{ type: ObjectId, ref: 'Employee', required: true},
	time:		{ type: Date, required: true },
	done:		{ type: Boolean, required: true },
	guest:		{
					email:		{ type: String },
					name:		{ type: String, required: true },
					phone:		{ type: String, required: true }
				},
	createdAt:	{ type: Date, required: true },
	updatedAt:	{ type: Date, required: true }
});

AppointmentSchema.pre('save', async () => {
	if (this.createdAt == null) this.createdAt = new Date();
	this.updatedAt = new Date();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);