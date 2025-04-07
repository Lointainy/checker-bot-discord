const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');
const { loadSettings, saveSettings } = require('../services/settings');

let settings = loadSettings();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Set kick message')
		.addStringOption((option) => option.setName('msg').setDescription('Message to send when kicking user').setRequired(true))
		.addStringOption((option) => option.setName('msgdm').setDescription('Message to send as DM when kicking user').setRequired(true)),

	async execute(interaction) {
		const guildId = interaction.guild.id;

		const msg = interaction.options.getString('msg');
		const msgDM = interaction.options.getString('msgdm');

		settings[guildId].msg.main = msg;
		settings[guildId].msg.dm = msgDM;

		saveSettings(settings);

		await interaction.reply(`✅ Text message updated`);
	}
};

