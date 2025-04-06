const fs = require('fs');

function convertToMilliseconds(hours, minutes) {
	const msPerMinute = 60 * 1000;
	const msPerHour = 60 * msPerMinute;

	return hours * msPerHour + minutes * msPerMinute;
}

module.exports = {
	convertToMilliseconds
};
