const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
const defaultSettings = require('../config/default');

module.exports = {
	data: new SlashCommandBuilder().setName('reset').setDescription('Reset settings'),

	async execute(interaction) {
		const guildId = interaction.guildId;
		try {
			settings[guildId] = {
				...defaultSettings
			};

			fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

			await interaction.reply(`✅ Settings have been reset to default.`);
		} catch (error) {
			console.error('❌ Error resetting settings:', error);
			await interaction.reply('❌ There was an error resetting the settings.');
		}
	}
};

