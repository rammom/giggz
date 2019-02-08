const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let UserSchema = new Schema({
	email:			{ type: String, required: true },
	name: 			{ type: String, required: true },
	phone:			{ type: String },
	appointments:	[{ type: ObjectId, ref: 'Appointment'}],
	createdAt:		{ type: String, required: true },
	updatedAt: 		{ type: String, required: true }
});

UserSchema.pre('save', async () => {
	if (this.createdAt == null) this.createdAt = new Date();
	this.updatedAt = new Date();
});

module.exports = mongoose.model('User', UserSchema);