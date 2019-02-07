const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	createdAt:	{ type: Date, default: Date.now },
	updatedAt: 	{ type: Date, default: Date.now }
});

AvailabilitySchema.pre('save', function(next) {

	const datetime = new Date();
	if (this.createdAt == null) this.createdAt = datetime;
	this.updatedAt = datetime;

	// moose: Make this check async to avoid blocking issues.. This implementation is VERY NAIVE!!!
	/* 
		Check for valid Availability structure (times align)
		> Time should be between 0 and 1439 (1440 minutes in a day)
		> Each slot's start time should be before its end time
		> A slot's start time should be after the previous slot's end time
	*/
	// const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	// days.forEach((day) => {
	// 	if (this[day].length == 0) continue;

	// 	let new_day = [];
	// 	let slot = this[day][0];
	// 	slot.start = max(0, slot.start);
	// 	slot.end = min(1439, slot.end);
	// 	new_day.push(slot);

	// 	for (let i = 1; i < this[day].length; ++i){
	// 		let slot = this[day][i];
	// 		slot.start = max(0, slot.start);
	// 		slot.end = min(1439, slot.end);
			
	// 	}
	// });
	next();
});

module.exports = mongoose.model('Availability', AvailabilitySchema);

// let current_slot = Object.assign({}, this[day][i]);
			// let previous_slot = Object.assign({}, this[day][i-1]);

			// // check first element
			// if (i == 1){
			// 	if (previous_slot.start < 0 || previous_slot.start > 1439 || previous_slot.end < 0 || previous_slot.end > 1439 || previous_slot.start >= previous_slot.end)
			// 		next(new Error('Invalid time slots!'));
			// }

			// // check current element
			// if (current_slot.start < 0 || current_slot.start > 1439 || 
			// 	current_slot.end < 0 || current_slot.end > 1439 || 
			// 	current_slot.start >= current_slot.end || 
			// 	previous_slot.end > current_slot.start)
			// 	next(new Error('Invalid time slots!'));