let guildIntervals = new Map();

let checkMembers;

function setup({ checkMembersFunc }) {
	checkMembers = checkMembersFunc;
}

function startInterval(guildId, interval) {
	if (!guildIntervals.has(guildId)) {
		const guildInterval = setInterval(() => checkMembers(guildId), interval * 1000);

		guildIntervals.set(guildId, guildInterval);

		console.log(`🔁 Interval started for ${guildId}`);
	}
}

function updateInterval(guildId, interval) {
	stopInterval(guildId);
	startInterval(guildId, interval);
}

function stopInterval(guildId) {
	if (guildIntervals.has(guildId)) {
		clearInterval(guildIntervals.get(guildId));

		guildIntervals.delete(guildId);

		console.log(`⏹️ Interval stopped for ${guildId}`);
	}
}

module.exports = {
	setup,
	startInterval,
	updateInterval,
	stopInterval,
	guildIntervals
};

