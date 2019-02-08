/*
	Commonly used functions throughout project
*/

/**
 * 	time_to_minutes() converts standard world time to amount of minutes from midnight to that time
 * 
 * @param {hour of day} hours 
 * @param {minute of hour} minutes 
 * @returns amount of minutes from midnight to given time or null if given time invalid
 */
const time_to_minutes = (hours, minutes=0) => {
	if ( hours < 0 || hours > 23 || minutes < 0 || minutes > 59 ) return null;
	return hours * 60 + minutes;
}

module.exports = {
	time_to_minutes,
}