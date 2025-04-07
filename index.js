require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { Client, Events, GatewayIntentBits, Collection, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { CLIENT_ID, TOKEN } = process.env;
const { convertToMilliseconds, updateConfig } = require('./utility');
const { loadSettings, saveSettings } = require('./services/settings');
const intervalManager = require('./services/interval');

const COMMANDS_PATH = path.join(__dirname, 'commands');

const defaultSettings = require('./config/default');
let settings = loadSettings();

const commands = [];

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();
intervalManager.setup({ checkMembersFunc: checkMembers });

client.on('ready', async () => {
	console.log(`✅ Logged in as ${client.user.tag}`);

	await deployCommands();
	await registerCommands();

	for (const [guildId] of client.guilds.cache) {
		if (!settings[guildId]) {
			settings[guildId] = {
				...defaultSettings
			};

			saveSettings(settings);

			console.log(`➕  New guild settings added: ${guildId}`);
		}

		await checkMembers(guildId);

		const interval = settings[guildId].time.checkInterval;
		intervalManager.startInterval(guildId, interval);
	}
});

client.on('guildCreate', async (guild) => {
	const guildId = guild.id;

	console.log(`➕ Bot added to new guild: ${guild.name} (${guildId})`);

	if (!settings[guildId]) {
		settings[guildId] = {
			...defaultSettings
		};

		saveSettings(settings);
	}

	await registerCommands(guildId);

	await checkMembers(guildId);

	const interval = settings[guildId].time.checkInterval;
	intervalManager.startInterval(guildId, interval);
});

client.on('guildDelete', async (guild) => {
	const guildId = guild.id;

	console.log(`❌ Bot removed from guild: ${guildId}`);

	intervalManager.stopInterval(guildId);

	if (settings[guildId]) {
		delete settings[guildId];
		saveSettings(settings);
	}

	client.guilds.cache.delete(guildId);
});

client.on('guildMemberAdd', (member) => {
	const guildId = member.guild.id;
	const hasRole = member.roles.cache.has(settings[guildId].role);

	if (!member.user.bot && hasRole) {
		settings[guildId].users[member.id] = {
			joinedAt: member.joinedAt.getTime()
		};
		saveSettings(settings);
	}

	console.log(`👤 ${member.user.tag} is join to ${guildId}`);
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

async function deployCommands() {
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

async function registerCommands(guildId) {
	const rest = new REST().setToken(TOKEN);
	try {
		console.log(`#️⃣  Started refreshing ${commands.length} application (/) commands.`);

		let data;

		if (guildId) {
			data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
		} else {
			data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		}

		console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}

async function checkMembers(guildId) {
	const guild = await client.guilds.fetch(guildId);
	const members = await guild.members.fetch();
	const timeLimit = convertToMilliseconds(settings[guildId].time.hours, settings[guildId].time.minutes);
	let count = {
		total: 0,
		deleted: 0
	};
	timePassed = '';

	if (!guild) {
		console.log(`❌ Guild ${guildId} is no longer available. Skipping...`);
		return;
	}

	for (const member of members.values()) {
		const hasRole = member.roles.cache.has(settings[guildId].role);

		if (!member.user.bot && hasRole) {
			count.total += 1;

			if (!settings[guildId].users[member.id]) {
				settings[guildId].users[member.id] = {
					joinedAt: member.joinedAt.getTime()
				};
			}

			const joinTime = settings[guildId].users[member.id].joinedAt;
			const timePassed = Date.now() - joinTime;

			if (timePassed > timeLimit) {
				try {
					await member.send(settings[guildId].msg.dm);
					await member.kick('settings[guildId].msg.main');

					console.log(`🚪 Kicked ${member.id} from ${guildId}`);
				} catch (err) {
					console.error(`❌ Kick failed ${member.user.tag}:`, err.message);
				}

				count.deleted += 1;

				delete settings[guildId].users[member.id];

				saveSettings(settings);
			}
		}
	}

	console.log(`😈 ${count.total} devils found on ${guildId}`);
	console.log(`😈 ${count.deleted} devils deleted from ${guildId}`);

	saveSettings(settings);
}

client.login(TOKEN);
