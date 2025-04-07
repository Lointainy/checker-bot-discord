const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');
const defaultSettings = require('../config/default');
const { startInterval } = require('../services/interval');

module.exports = {
	data: new SlashCommandBuilder().setName('run').setDescription('Run bot'),

	async execute(interaction) {
		let settings = loadSettings();
		const guildId = interaction.guildId;

		try {
			const interval = settings[guildId].time.checkInterval;

			if (settings[guildId].status) {
				return await interaction.reply(`✅ bot now is running`);
			}

			settings[guildId].status = true;

			saveSettings(settings);

			startInterval(guildId, interval);

			await interaction.reply(`✅ bot is run`);
		} catch (error) {
			console.error('❌ bot did not run', error);
			await interaction.reply('❌ bot is not running');
		}
	}
};

