const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AvailabilitySchema = new Schema({
	monday:		[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	tuesday:	[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	wednesday:	[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	thursday:	[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	friday:		[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	saturday:		[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	sunday:		[{
					start:		{ type: Number, req: true },
					end:		{ type: Number, req: true }
				}],
	createdAt:	{ type: Date, required: true },
	updatedAt: 	{ type: Date, required: true }
});


AvailabilitySchema.pre('save', async () => {

	if (this.createdAt == null) this.createdAt = new Date();
	this.updatedAt = new Date();

	// moose: Make this check async to avoid blocking issues.. This implementation is VERY NAIVE!!!
	/* 
		Check for valid Availability structure (times align)
		> Time should be between 0 and 1439 - 1440 minutes in a day
		> Each slot's start time should be before its end time
		> A slot's start time should be after the previous slot's end time
	*/
	const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	days.forEach((day) => {
		for (let i = 1; i < day.length; ++i){
			let current_slot = Object.assign({}, this[day][i]);
			let previous_slot = Object.assign({}, this[day][i-1]);

			// check first element
			if (i == 1){
				if (previous_slot.start < 0 || previous_slot.start > 1439 || previous_slot.end < 0 || previous_slot.end > 1439 || previous_slot.start >= previous_slot.end)
					next(new Error('Invalid time slots!'));
			}
			
			// check current element
			if (current_slot.start < 0 || current_slot.start > 1439 || 
				current_slot.end < 0 || current_slot.end > 1439 || 
				current_slot.start >= current_slot.end || 
				previous_slot.end > current_slot.start)
				next(new Error('Invalid time slots!'));
		}
	});
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
