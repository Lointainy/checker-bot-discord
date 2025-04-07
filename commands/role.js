const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');

let settings = loadSettings();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Set role')
		.addStringOption((option) => option.setName('id').setDescription('Set Role id').setRequired(true)),

	async execute(interaction) {
		const roleId = interaction.options.getString('id');
		const guild = interaction.guild;
		const { id: guildId } = guild;
		const role = guild.roles.cache.get(roleId);

		if (!role) {
			return await interaction.reply('❌ Role is not found.');
		}

		settings[guildId].role = roleId;

		saveSettings(settings);

		await interaction.reply('✅ role is updated');
	}
};

