const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('discord.js');

const SETTINGS_PATH = path.resolve(__dirname, '..', 'config', 'settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Set kick message')
		.addStringOption((option) => option.setName('msg').setDescription('Message to send when kicking user').setRequired(true))
		.addStringOption((option) => option.setName('msgdm').setDescription('Message to send as DM when kicking user').setRequired(true)),

	async execute(interaction) {
		const msg = interaction.options.getString('msg');
		const msgDM = interaction.options.getString('msgdm');

		let config = JSON.parse(fs.readFileSync(SETTINGS_PATH));

		config.msg.kickMsg = msg;
		config.msg.kickMsgDM = msgDM;

		fs.writeFileSync(SETTINGS_PATH, JSON.stringify(config, null, 2));

		await interaction.reply(`✅ Text message updated`);
	}
};

