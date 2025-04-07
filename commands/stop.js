const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');
const defaultSettings = require('../config/default');
const { stopInterval } = require('../services/interval');

module.exports = {
	data: new SlashCommandBuilder().setName('stop').setDescription('Stop bot'),

	async execute(interaction) {
		let settings = loadSettings();
		const guildId = interaction.guildId;

		try {
			settings[guildId].status = false;

			saveSettings(settings);

			stopInterval(guildId);

			await interaction.reply(`✅ bot has stopped`);
		} catch (error) {
			console.error('❌ bot did not stop', error);
			await interaction.reply('❌ bot is not stopping');
		}
	}
};

