const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');
const defaultSettings = require('../config/default');

module.exports = {
	data: new SlashCommandBuilder().setName('reset').setDescription('Reset settings'),

	async execute(interaction) {
		let settings = loadSettings();
		const guildId = interaction.guildId;

		try {
			settings[guildId] = {
				...defaultSettings
			};

			saveSettings(settings);

			updateInterval(guildId, defaultSettings.time.checkInterval);

			await interaction.reply(`✅ Settings have been reset to default.`);
		} catch (error) {
			console.error('❌ Error resetting settings:', error);
			await interaction.reply('❌ There was an error resetting the settings.');
		}
	}
};

