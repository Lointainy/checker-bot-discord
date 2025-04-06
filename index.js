require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { Client, Events, GatewayIntentBits, Collection, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { convertToMilliseconds, updateConfig } = require('./utility');

const { ROLE_ID, GUILD_ID, CLIENT_ID, TOKEN } = process.env;

const FILE_PATH = path.join(__dirname, 'data', 'joinTimes.json');
const SETTINGS_PATH = path.join(__dirname, 'config', 'settings.json');
const COMMANDS_PATH = path.join(__dirname, 'commands');

let config = JSON.parse(fs.readFileSync(SETTINGS_PATH));

let userJoinTimes = {};
let firstRunBot = true;
const commands = [];

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

fs.watch(SETTINGS_PATH, (eventType) => {
	if (eventType === 'change') {
		updateConfig(config, SETTINGS_PATH);
	}
});

if (fs.existsSync(FILE_PATH)) {
	userJoinTimes = JSON.parse(fs.readFileSync(FILE_PATH));
}

client.on('ready', async () => {
	console.log(`✅ Logged in as ${client.user.tag}`);

	if (firstRunBot) {
		console.log('1️⃣  First run');

		await deployCommands();
		await registerCommands();
		await checkAllMembers();

		firstRunBot = false;
	}

	setInterval(checkMembers, config.time.checkInterval * 1000);
});

client.on('guildMemberAdd', (member) => {
	if (!member.user.bot) {
		userJoinTimes[member.id] = Date.now();
		saveJoinTimes();
		console.log(`👤 ${member.user.tag} is join`);
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

function saveJoinTimes() {
	fs.writeFileSync(FILE_PATH, JSON.stringify(userJoinTimes, null, 2));
}

async function registerCommands() {
	const rest = new REST().setToken(TOKEN);
	try {
		console.log(`#️⃣  Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

		console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}

async function deployCommands(params) {
	const commandFiles = fs.readdirSync(COMMANDS_PATH).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(COMMANDS_PATH, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			client.commands.set(command.data.name, command);
		} else {
			console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

async function checkAllMembers() {
	const guild = await client.guilds.fetch(GUILD_ID);
	const members = await guild.members.fetch();
	let count = 0;

	for (const member of members.values()) {
		if (!member.user.bot && member.roles.cache.has(ROLE_ID)) {
			if (!userJoinTimes[member.id]) {
				userJoinTimes[member.id] = member.joinedAt.getTime();
			}
			count += 1;
		}
	}

	console.log(`😈 ${count} devils found`);

	saveJoinTimes();
}

async function checkMembers() {
	const guild = await client.guilds.fetch(GUILD_ID);
	const members = await guild.members.fetch();
	const timeLimit = convertToMilliseconds(config.time.hours, config.time.minutes);

	for (const member of members.values()) {
		const joinTime = userJoinTimes[member.id];
		const hasRole = member.roles.cache.has(ROLE_ID);
		const timePassed = Date.now() - joinTime;

		if (!member.user.bot && joinTime && hasRole) {
			if (timePassed > timeLimit) {
				try {
					await member.send(config.msg.kickMsgDM);
					await member.kick('');

					console.log(`🚪 Kicked ${member.user.tag}`);
				} catch (err) {
					console.error(`❌ Kick failed ${member.user.tag}:`, err.message);
				}

				delete userJoinTimes[member.id];

				saveJoinTimes();
			}
		}
	}
}

client.login(TOKEN);
