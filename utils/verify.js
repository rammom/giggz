/*
	Verification tools
*/

/*
	Given object and list<string> of expected properties
	Returns true if all given properties are in object,
			false otherwise
*/
const hasProperties = (obj, properties) => {
	properties.forEach((p) => {
		if (!obj[p]) return false;
	});
	return true;
}

/*
	Checks if given string matches expected email format
*/
const isEmail = (email) => {
	expression = /[A-z0-9\.\_]+@[A-z0-9]+.[A-z]+/g
	if (!email.match(expression)) return false;
	return true;
}

/*
	Given string and expression returns true if match is found
										false otherwise
*/
const rmatch = (str, expression) => {
	if (!str.match(expression)) return false;
	return true;
}

/*
	Verify given string length is >= len
*/
const length = (str, len) => {
	if (str.length >= len) return true;
	return false;
}

/*
	Compares string characters, returns true if string values are equivalent
*/
const isSameString = (str1, str2) => {
	return str1 === str2;
}

const isAlpha = (str) => {
	let expr = /[A-z]+/g
	if (!str.match(expr)) return false;
	return true;
}

module.exports = {
	hasProperties,
	isEmail,
	rmatch,
	length,
	isSameString,
	isAlpha,
}