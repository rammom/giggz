const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let StoreSchema = new Schema({
   name:        { type: String, required: true },
   slug:		{ type: String, required: true },
   address:     {
            		street:     { type: String, required: true },
                	city:       { type: String, required: true },
                	state:      { type: String, required: true },
					country:    { type: String, required: true },
					lat:		{ type: Number, required: true },
					lng:		{ type: Number, required: true }
                },
   hours:       { type: ObjectId, ref: 'Availability', required: true },
   employees:	[{ type: ObjectId, ref: 'Employee' }],
   services:	[{ type: ObjectId, ref: 'Service' }],
   description:	{ type: String, default: "" },
   createdAt:	{ type: Date },
   updatedAt:	{ type: Date }
});

StoreSchema.pre('save', function(next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	if(!this.employees){
		this.employees = [];
	}
	if(!this.services){
		this.services = [];
	}
	next();
});

module.exports = mongoose.model('Store', StoreSchema);