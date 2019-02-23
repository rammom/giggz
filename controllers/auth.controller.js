const verify = require('../utils/verify');
const utils = require('../utils/utils');
const handleError = utils.handleError;
const sendResponse = utils.sendResponse;
const User = require('../models/User');

/*
	Register a new user
*/
const register = async (req, res, next) => {

	let email = req.body.email;
	let password = req.body.password;
	let password_verify = req.body.password_verify;
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let phone = req.body.phone;
	const appointments = [];
	const employee = null;

	let invalid_fields = [];

	// verify required fields
	if (!email || !verify.isEmail(email)) 
		invalid_fields.push('email');
	if (!password || !verify.isValidPassword(password))
		invalid_fields.push('password');
	if (!password_verify || !verify.isSameString(password, password_verify))
		invalid_fields.push('password_verify');
	if (!firstname || !verify.length(firstname, 2) || !verify.isAlpha(firstname))
		invalid_fields.push('firstname');
	if (!lastname || !verify.length(lastname, 2) || !verify.isAlpha(lastname))
		invalid_fields.push('lastname');
	if (phone && !verify.isPhoneNumber(phone))
		invalid_fields.push('phone');


	if (invalid_fields.length != 0) 
		return handleError(res, null, 400, "invalid fields", {invalid_fields});

	// format attributes
	[email, firstname, lastname] = utils.capitalize([email, firstname, lastname]);

	// check for duplicates in db
	let duplicate_fields = [];
	let findError = null;
	let query = (phone) ? { $or: [{ email }, { phone }] } : {email};
	await User.find(query)
		.then((users) => {
			if (!users) return;
			users.forEach((user) => {
				if (user.email == email) duplicate_fields.push("email");
				if (phone && user.phone == phone) duplicate_fields.push("phone");
			});
		})
		.catch((err) => {
			return findError = err;
		});
	
	if (findError) 
		return handleError(res, findError, 500);
	if (duplicate_fields.length != 0) 
		return handleError(res, null, 400, "duplicate fields", {duplicate_fields})
	
	// hash password
	let hashError = null;
	password = await utils.hashPassword(password, 10)
		.catch((err) => {
			hashError = err;
		});

	if (hashError)
		return handleError(res, hashError, 500);

	// create User object & save to db
	let user = new User({
		email,
		password,
		firstname,
		lastname,
		phone,
		appointments,
		employee
	});

	let saveError = null;
	await user.save()
		.catch((err) => {
			saveError = err;
		});
	
	if (saveError)
		return handleError(res, saveError, 500);

	// success
	return sendResponse(res, {user}, "registered");
}

/*
	Login user
*/
const login = (req, res, next) => {
	let user = req.user;
	user.password = null;
	return sendResponse(res, {user}, "authenticated");
}

/*
	Logout user
*/
const logout = (req, res, next) => {
	req.logout();
	return sendResponse(res, "logged out");
}

module.exports = {
	register,
	login,
	logout,
}	