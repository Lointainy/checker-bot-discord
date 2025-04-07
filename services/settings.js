const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'data', 'settings.json');

function loadSettings() {
	return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
}

function saveSettings(settings) {
	fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

module.exports = {
	loadSettings,
	saveSettings
};

