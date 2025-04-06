require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const roleID = process.env.ROLE_ID;
const guildID = process.env.GUILD_ID;
const FILE_PATH = './data/joinTimes.json';
const config = {
	time: require('./config/time'),
	msg: require('./config/msg')
};

let userJoinTimes = {};
let firstUpBot = true;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

if (fs.existsSync(FILE_PATH)) {
	userJoinTimes = JSON.parse(fs.readFileSync(FILE_PATH));
}

function saveJoinTimes() {
	fs.writeFileSync(FILE_PATH, JSON.stringify(userJoinTimes, null, 2));
}

client.on('ready', async () => {
	console.log(`✅ Logged in as ${client.user.tag}`);
	if (firstUpBot) {
		console.log('1️⃣  First run');

		await checkAllMembers();
	}
	firstUpBot = false;
	setInterval(checkMembers, config.time.checkInterval * 1000);
});

client.on('guildMemberAdd', (member) => {
	if (!member.user.bot) {
		userJoinTimes[member.id] = Date.now();
		saveJoinTimes();
		console.log(`👤 ${member.user.tag} is join`);
	}
});

function convertToMilliseconds(hours, minutes) {
	const msPerMinute = 60 * 1000;
	const msPerHour = 60 * msPerMinute;

	return hours * msPerHour + minutes * msPerMinute;
}

async function checkAllMembers() {
	const guild = await client.guilds.fetch(guildID);
	const members = await guild.members.fetch();
	let count = 0;

	for (const member of members.values()) {
		if (!member.user.bot && member.roles.cache.has(roleID)) {
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
	const guild = await client.guilds.fetch(guildID);
	const members = await guild.members.fetch();
	const timeLimit = convertToMilliseconds(config.time.hours, config.time.minutes);

	for (const member of members.values()) {
		const joinTime = userJoinTimes[member.id];
		const hasRole = member.roles.cache.has(roleID);
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

client.login(process.env.TOKEN);
