const Utils = require(global.dirname + '/utils/utils.js');

const tellEveryone = (str) => {
	const client = global.client;
	const Persist = global.Persist;
	client.guilds.array().forEach(guild => {
		if ( ! Persist.ready[guild.id]) return;
		const channelID = Persist.channel[guild.id];
		const channel = guild.channels.get(channelID);
		if ( ! channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
		channel.send(str);
	});
}
const notify = (res, id, name, url, startTime, rtime, type) => {
	const client = global.client;
	const Persist = global.Persist;
	const savePersist = global.savePersist;
	client.guilds.filter(guild => {
		if ( ! Persist[res]) Persist[res] = {};
		if ( ! Persist[res][guild.id]) Persist[res][guild.id] = {};
		if ( ! Persist[res][guild.id][type]) Persist[res][guild.id][type] = [];
		return Persist[res][guild.id][type].indexOf(id) < 0;
	}).array().forEach(guild => {
		if ( ! Persist.ready[guild.id]) return;
		const channelID = Persist.channel[guild.id];
		const channel = guild.channels.get(channelID);
		if ( !channel || ! channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
		channel.send({embed: {
			author: {
				name: client.user.username,
				icon_url: client.user.displayAvatarURL()
			},
			title: name,
			url: url,
			description: `Attention! ${Utils.formatDuration(rtime)} before start`,
			footer: {text: `${res} | Starts at: ${new Date(startTime.getTime() - 4 * 3600 * 1000).toLocaleString('en-US')}`}
		}});
		Persist[res][guild.id][type].push(id);
		savePersist();
	});
}

module.exports.tellEveryone = tellEveryone;
module.exports.notify = notify;
