const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const roles = ["Default", "Admin"]

let EmployeeSchema = new Schema({
    name:		{ type: String, required: true },
    hours:		{ type: ObjectId, ref: 'Availability', required: true },
    store:		{ type: ObjectId, ref: 'Store', required: true },
	services:	[{ type: ObjectId, ref: 'Service' }],
	role:		{ type: String, enum: roles, required: true },
	createdAt:	{ type: Date, required: true },
	updatedAt:	{ type: Date, required: true }
});

EmployeeSchema.pre('save', async () => {
	if (this.createdAt == null) this.createdAt = new Date();
	this.updatedAt = new Date();
});

module.exports = mongoose.model('Employee', EmployeeSchema);