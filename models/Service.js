const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let ServiceSchema = new Schema({
	name:		{ type: String, required: true },
	store:		{ type: ObjectId, ref: 'Store', required: true },
	price:		{ type: Number, required: true },
	length:		{ type: Number, required: true },
	createdAt:	{ type: Date },
	updatedAt: 	{ type: Date }
});

ServiceSchema.pre('save', function (next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	next();
});

module.exports = mongoose.model('Service', ServiceSchema);