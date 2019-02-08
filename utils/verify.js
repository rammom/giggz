/*
	Verification tools
*/


const checkObjectProperties = (obj, properties) => {
	properties.forEach((p) => {
		if (!obj[p]) return false;
	});
	return true;
}

module.exports = {
	checkObjectProperties
}