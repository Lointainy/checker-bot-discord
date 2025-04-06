const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Set role')
		.addStringOption((option) => option.setName('id').setDescription('Set Role id').setRequired(true)),

	async execute(interaction) {
		const guildId = interaction.guild.id;
		const roleId = interaction.options.getString('id');

		settings[guildId].role = roleId;

		fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

		await interaction.reply(`✅ role is updated`);
	}
};

