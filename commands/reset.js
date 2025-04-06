const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const settings = path.resolve(__dirname, '..', 'config', 'settings.json');
const defaultSettings = path.resolve(__dirname, '..', 'config', 'settingsDefault.json');

module.exports = {
	data: new SlashCommandBuilder().setName('reset').setDescription('Reset settings'),

	async execute(interaction) {
		try {
			if (!fs.existsSync(defaultSettings)) {
				throw new Error(`❌ Default settings file not found at: ${defaultSettings}`);
			}
			if (!fs.existsSync(settings)) {
				throw new Error(`❌ Settings file not found at: ${settings}`);
			}

			let config = {
				default: JSON.parse(fs.readFileSync(defaultSettings)),
				main: JSON.parse(fs.readFileSync(settings))
			};

			config.main = config.default;

			fs.writeFileSync(settings, JSON.stringify(config.main, null, 2));

			await interaction.reply(`✅ Settings have been reset to default.`);
		} catch (error) {
			console.error('❌ Error resetting settings:', error);
			await interaction.reply('❌ There was an error resetting the settings.');
		}
	}
};

