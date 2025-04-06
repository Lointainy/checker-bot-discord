require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const roleID = process.env.ROLE_ID;
const guildID = process.env.GUILD_ID;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.on('ready', async () => {
	console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
