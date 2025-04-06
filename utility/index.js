const fs = require('fs');

function convertToMilliseconds(hours, minutes) {
	const msPerMinute = 60 * 1000;
	const msPerHour = 60 * msPerMinute;

	return hours * msPerHour + minutes * msPerMinute;
}

function updateConfig(config, path) {
	try {
		const newConfig = JSON.parse(fs.readFileSync(path));
		config = newConfig;
		console.log('⚙️  Config has been updated.');
	} catch (error) {
		console.error('❌ Error reading the config file:', error);
	}
}

module.exports = {
	convertToMilliseconds,
	updateConfig
};

