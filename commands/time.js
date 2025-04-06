const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'config', 'settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Set times after user is kicked')
		.addIntegerOption((option) => option.setName('hours').setDescription('Hours').setRequired(true))
		.addIntegerOption((option) => option.setName('minutes').setDescription('Minunter').setRequired(false))
		.addIntegerOption((option) => option.setName('interval').setDescription('Seconds').setRequired(false)),

	async execute(interaction) {
		const hours = interaction.options.getInteger('hours');
		const minutes = interaction.options.getInteger('minutes');
		const interval = interaction.options.getInteger('interval');

		let config = JSON.parse(fs.readFileSync(SETTINGS_PATH));

		config.time.hours = hours;
		config.time.minutes = minutes;
		config.time.checkInterval = interval;

		fs.writeFileSync(SETTINGS_PATH, JSON.stringify(config, null, 2));

		await interaction.reply(`✅ Time updated: ${hours} hours and ${minutes} minutes. Bot update interval ${interval}`);
	}
};

