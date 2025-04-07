const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');
const { updateInterval } = require('../services/interval');
const defaultSettings = require('../config/default');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Set times after user is kicked')
		.addIntegerOption((option) => option.setName('hours').setDescription('Hours max 24h').setRequired(true))
		.addIntegerOption((option) => option.setName('minutes').setDescription('Minutes min 1').setRequired(false))
		.addIntegerOption((option) => option.setName('interval').setDescription('Seconds min 600sec').setRequired(false)),

	async execute(interaction) {
		let settings = loadSettings();
		const guildId = interaction.guild.id;
		let hours = interaction.options.getInteger('hours');
		let minutes = interaction.options.getInteger('minutes');
		let interval = interaction.options.getInteger('interval');

		hours = Math.min(hours, defaultSettings.time.hours);

		if (hours === 0 && minutes < 1) {
			minutes = 1;
		}

		if (hours === 24) {
			minutes = 0;
		}

		minutes = Math.min(minutes, 60);

		interval = Math.max(Math.min(interval, defaultSettings.time.checkInterval), defaultSettings.time.checkInterval);

		settings[guildId].time.hours = hours;
		settings[guildId].time.minutes = minutes;
		settings[guildId].time.checkInterval = interval;

		saveSettings(settings);

		updateInterval(guildId, interval);

		await interaction.reply(`✅ Time updated: ${hours} hours and ${minutes} minutes. Bot update interval ${interval}`);
	}
};

