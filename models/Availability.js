const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

let AvailabilitySchema = new Schema({
	monday:		[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	tuesday:	[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	wednesday:	[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	thursday:	[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	friday:		[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	saturday:		[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	sunday:		[{
					start:		{ type: Number, required: true },
					end:		{ type: Number, required: true }
				}],
	createdAt:	{ type: Date },
	updatedAt: 	{ type: Date }
});

//Method used to check if a passed-in availability fits within time slot
AvailabilitySchema.methods.isSubset = async function(availability) { 
	const object = this;
	const isSubset = await new Promise((resolve, reject) => {
		let subset = true;
		days.forEach((day) => {
			if (availability[day].length == 0){
				return; //Skip if passed-in availability is empty
			} 

			//If passed-in availability is not empty but reference availability is
			if (availability[day].length > 0 && object[day].length == 0){ 
				return resolve(false);
			}
			
			availability[day].forEach((slot) => { 
				let valid = false; //Assume that subset is invalid
				object[day].forEach((this_slot) =>{ //Iterating through own daily hours
					if(slot.start >= this_slot.start && slot.end <= this_slot.end){
						valid = true; //Flagging valid to true if found
					}
					return;
				})
				if (!valid){ //Ensures each slot for each day is valid
					resolve(false);	//If one is invalid, raise the overall subset value to false
				}
			})
		})
		resolve(subset); //Return overall subset value
	});
	return isSubset;
}

AvailabilitySchema.pre('save', function(next) {
	let datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;
	
	// moose: Make this check async to avoid blocking issues.. This implementation is VERY NAIVE!!!
	/* 
		Check for valid Availability structure (times align)
		> Time should be between 0 and 1439 (1440 minutes in a day)
		> Each slot's start time should be before its end time
		> A slot's start time should be after the previous slot's end time
	*/

	days.forEach((day) => {
		if (this[day].length == 0) return;
		let slot_count = this[day].length;

		// check slot 1
		let current_slot = this[day][0];
		if (current_slot.start < 0 || current_slot.start > 1439 || current_slot.end < 0 || current_slot.end > 1439)
			next(new Error('Invalid time slots! - time should be in minutes up to 1439'));
		if (current_slot.start >= current_slot.end)
			next(new Error('Invalid time slots! - start time >= end time'));
			
		// check other slots if available
		for (let i = 1; i < slot_count; ++i) {
			let current_slot = this[day][i];
			let previous_slot = this[day][i - 1];

			// check current element
			if (current_slot.start < 0 || current_slot.start > 1439 || current_slot.end < 0 || current_slot.end > 1439 || current_slot.start >= current_slot.end)
				next(new Error('Invalid time slots! - time should be in minutes up to 1439'));

			// compare to previous element 
			if (current_slot.start < previous_slot.end)
				next(new Error('Invalid time slots! - start time >= end time'));
		}
	});
	next();
});

module.exports = mongoose.model('Availability', AvailabilitySchema);

