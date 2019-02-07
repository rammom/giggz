const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let ServiceSchema = new Schema({
	name:		{ type: String, required: true },
	store:		{ type: ObjectId, ref: 'Store', required: true },
	price:		{ type: Number, required: true },
	length:		{ type: Number, required: true },
	createdAt:	{ type: Date, required: true },
	updatedAt: 	{ type: Date, required: true }
});

ServiceSchema.pre('save', async () => {
	if (this.createdAt == null) this.createdAt = new Date();
	this.updatedAt = new Date();
});

module.exports = mongoose.model('Service', ServiceSchema);