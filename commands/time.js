const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Set times after user is kicked')
		.addIntegerOption((option) => option.setName('hours').setDescription('Hours').setRequired(true))
		.addIntegerOption((option) => option.setName('minutes').setDescription('Minunter').setRequired(false))
		.addIntegerOption((option) => option.setName('interval').setDescription('Seconds').setRequired(false)),

	async execute(interaction) {
		const guildId = interaction.guild.id;
		const hours = interaction.options.getInteger('hours');
		const minutes = interaction.options.getInteger('minutes');
		const interval = interaction.options.getInteger('interval');

		settings[guildId].time.hours = hours;
		settings[guildId].time.minutes = minutes;
		settings[guildId].time.checkInterval = interval;

		fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

		await interaction.reply(`✅ Time updated: ${hours} hours and ${minutes} minutes. Bot update interval ${interval}`);
	}
};

