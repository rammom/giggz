const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

let StoreSchema = new Schema({
   name:        { type: String, required: true },
   address:     {
            		street:     { type: String, required: true },
                	city:       { type: String, required: true },
                	state:      { type: String, required: true },
                	country:    { type: String, required: true }
                },
   hours:       { type: ObjectId, ref: 'Availability', required: true },
   employees:	[{ type: ObjectId, ref: 'Employee' }],
   services:	[{ type: ObjectId, ref: 'Service' }],
   createdAt:	{ type: Date },
   updatedAt:	{ type: Date }
});

StoreSchema.virtual('fullAddress').get(() => {
	return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country}`.toUpperCase();
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