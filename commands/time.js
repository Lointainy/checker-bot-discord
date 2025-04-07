const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Set times after user is kicked')
		.addIntegerOption((option) => option.setName('hours').setDescription('Hours max 24h').setRequired(true))
		.addIntegerOption((option) => option.setName('minutes').setDescription('Minutes min 1').setRequired(false))
		.addIntegerOption((option) => option.setName('interval').setDescription('Seconds min 600sec').setRequired(false)),

	async execute(interaction) {
		const guildId = interaction.guild.id;
		const hours = interaction.options.getInteger('hours');
		const minutes = interaction.options.getInteger('minutes');
		const interval = interaction.options.getInteger('interval');

		settings[guildId].time.hours = hours > 24 ? 24 : hours;
		settings[guildId].time.minutes = minutes < 1 && hours == 0 ? 1 : minutes;
		settings[guildId].time.checkInterval = interval < 600 ? 600 : interval;

		fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

		await interaction.reply(`✅ Time updated: ${hours} hours and ${minutes} minutes. Bot update interval ${interval}`);
	}
};

