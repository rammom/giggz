/*
	Commonly used functions throughout project
*/

const bcrypt = require('bcryptjs');

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

/**
 * 	Set all characters of each given string to upper case
 * 
 * @param {list of strings} items 
 * @returns list of capitalized strings
 */
const capitalize = (items) => {
	for (let i = 0; i < items.length; ++i)
		items[i] = items[i].toUpperCase();
	return items;
}

/**
 * 	Hash a given password
 * 
 * @param {password to be hashed} password 
 * @param {rounds of salting} saltRounds 
 */
const hashPassword = async (password, saltRounds) => {

	const hashedPass = await new Promise((resolve, reject) => {
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) reject(err);
			resolve(hash);
		});
	});

	return hashedPass;
}

/**
 * 	Compare plain text to a password hash
 * 
 * @param {plain text to compare to hash} password 
 * @param {a password hash} hash 
 */
const comparePassword = async (password, hash) => {
	match = false;
	await bcrypt.compare(password, hash)
		.then((res) => {
			match = res;
		});
	return match;
}

/**
 * 	Send error response back to client
 * 
 * @param {Express res object} res 
 * @param {error object} err 
 * @param {HTTP status code} status 
 * @param {Extra msg to include in error} msg 
 * @param {Baseline object to build response on} other_fields 
 */
const handleError = (res, err, status, msg="ERROR", other_fields={}) => {
	other_fields.msg = msg;
	other_fields.err = err;
	other_fields.status = status;
	return res.status(status).json(other_fields);
}

/**
 * 	Send a response back to client
 * 
 * @param {Express error object} res 
 * @param {Response body} body 
 * @param {Additional message to send with response} msg 
 * @param {Response status code} status 
 */
const sendResponse = (res, body={}, msg=null, status=200) => {
	if (typeof body == 'string' && typeof msg != 'string') msg = body;
	if (typeof body != 'object') body = {};
	if (typeof msg != 'string') msg="ok";
	if (typeof status != 'number') status=200;
	body.msg = (body.msg) ? body.msg : msg;
	body.status = status;
	return res.status(status).json(body);
}

/**
 * 	Move onto next if in development environment
 * 
 * @param {Express request object} req 
 * @param {Express response object} res 
 * @param {Express next object} next 
 */
const isDevelopment = (req, res, next) => {
	if (req.app.get('env') == 'development') next();
	else next('not authenticated');
}

/**
 * 	Check if current requesting user is authenticated
 * 	** Allows pass if in development environment **
 * 
 * @param {Express request object} req 
 * @param {Express response object} res 
 * @param {Express next object} next 
 */
const isAuthenticated = (req, res, next) => {
	if (req.app.get('env') == 'development') next();
	else if (req.user) next();
	else next('not authenticated');
}


module.exports = {
	time_to_minutes,
	capitalize,
	hashPassword,
	comparePassword,
	handleError,
	sendResponse,
	isDevelopment,
	isAuthenticated,
}