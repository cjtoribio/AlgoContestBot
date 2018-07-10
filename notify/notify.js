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
const notify = (id, name, url, time, rtime, type) => {
	const client = global.client;
	const Persist = global.Persist;
	const savePersist = global.savePersist;
	client.guilds.filter(guild => {
		if ( ! Persist.cf[guild.id]) Persist.cf[guild.id] = {};
		if ( ! Persist.cf[guild.id][type]) Persist.cf[guild.id][type] = [];
		return Persist.cf[guild.id][type].indexOf(id) < 0;
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
			footer: {text: `Starts at: ${new Date(time*1000).toGMTString()}`}
		}});
		Persist.cf[guild.id][type].push(id);
		savePersist();
	});
}

module.exports.tellEveryone = tellEveryone;
module.exports.notify = notify;