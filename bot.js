const fs = require('fs');
const sf = require('snekfetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const { token } = JSON.parse(fs.readFileSync(__dirname + '/auth.json', 'utf8'));
const Utils = require(__dirname + '/utils/utils.js');



if ( ! fs.existsSync(__dirname + '/config.json')) {
	fs.writeFileSync(__dirname + '/config.json', JSON.stringify({
		owner: "",
		prefix: "_"
	}, null, 2));
}
const Config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

if ( ! fs.existsSync(__dirname + '/persist.json')) {
	fs.writeFileSync(__dirname + '/persist.json', JSON.stringify({
		cf: {},
		ready: {},
		channel: {}
	}, null, 2));
}
const Persist = JSON.parse(fs.readFileSync(__dirname + '/persist.json', 'utf8'));
function savePersist() {
	fs.writeFileSync(__dirname + '/persist.json', JSON.stringify(Persist, null, 2));
}



const tellEveryone = (str) => {
	client.guilds.array().forEach(guild => {
		if ( ! Persist.ready[guild.id]) return;
		let channelID = Persist.channel[guild.id];
		let channel = guild.channels.get(channelID);
		if ( ! channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
		channel.send(str);
	});
}
const notify = (id, name, url, time, rtime, type) => {
	client.guilds.filter(guild => {
		if ( ! Persist.cf[guild.id]) Persist.cf[guild.id] = {};
		if ( ! Persist.cf[guild.id][type]) Persist.cf[guild.id][type] = [];
		return Persist.cf[guild.id][type].indexOf(id) < 0;
	}).array().forEach(guild => {
		if ( ! Persist.ready[guild.id]) return;
		let channelID = Persist.channel[guild.id];
		let channel = guild.channels.get(channelID);
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



let codeforcesList = [];
const codeforcesNotify = () => {
	codeforcesList.forEach(obj => {
		let rtime = -obj.relativeTimeSeconds;
		if (rtime <= 2*60*60) {
			notify(obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, obj.startTimeSeconds, rtime, 2);
		} else if (rtime <= 24*60*60) {
			notify(obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, obj.startTimeSeconds, rtime, 24);
		} else if (rtime <= 2*24*60*60) {
			notify(obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, obj.startTimeSeconds, rtime, 48);
		}
	});
}
let codeforcesFetchErrorTolerance = 5;
const codeforcesFetch = () => {
	sf.get('http://codeforces.com/api/contest.list')
	.then(res => {
		if (res.body.status === 'OK') {
			codeforcesList = res.body.result.filter(obj => obj.phase === 'BEFORE');
			codeforcesNotify();
			if (codeforcesFetchErrorTolerance <= 0) {
				tellEveryone("CodeForces API works again.");
			}
			codeforcesFetchErrorTolerance = 5;
		} else {
			codeforcesFetchErrorTolerance--;
			if (codeforcesFetchErrorTolerance === 0) {
				tellEveryone("CodeForces API isn't accessible at the moment. Please check other sources until it works again.");
			}
		}
	}).catch(err => {
		codeforcesFetchErrorTolerance--;
		if (codeforcesFetchErrorTolerance === 0) {
			tellEveryone("CodeForces API isn't accessible at the moment. Please check other sources until it works again.");
		}
	});
	setTimeout(codeforcesFetch, 1000*(60-new Date().getSeconds()));
}


client.on('ready', () => {
	console.log('Started running: ' + new Date());
	codeforcesFetch();
});
client.on('message', msg => {

	if ( ! msg.content.startsWith(Config.prefix)) return;
	let commandPart = msg.content.substring(Config.prefix.length);
	if (msg.channel.type === 'dm') {
		if (msg.author.id !== Config.owner) return;
		try {
			eval(commandPart.substring(4));
		} catch (err) {
			msg.reply(err.message)
		}
		return;
	}
	
	let is = Utils.istream(commandPart);
	let cmd = Utils.consume(is);
	if (cmd === 'help') {
		if (!Utils.isend(is)) {
			if ( ! msg.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
			msg.reply('Usage: help');
		} else {
			if ( ! msg.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
			msg.channel.send({embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.displayAvatarURL()
				},
				title: `${client.user.username} notifies you about upcoming algorithmic programming contests.`,
				description: `After the notification channel is set, the bot will notify you 48, 24 and 2 hours before an upcoming contest.`,
				fields: [
					{
						name: `How to set the notification channel?`,
						value: `Someone with \`ADMINISTRATOR\` permission must use the \`_setChannel\` command at the desired channel.\n`
							+ `Note that the bot must have permission to send messages to that channel. If you don't `
							+ `get a confirmation from the bot, it might be missing permission.`
					},
					{
						name: `Currently supported contest platforms:`,
						value: `CodeForces`
					}
				]
			}});
		}
	} else if (cmd === 'setChannel') {
		if (!Utils.isend(is)) {
			if ( ! msg.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
			msg.reply('Usage: setChannel');
		}
		else if ( ! msg.member.hasPermission('ADMINISTRATOR')) {
			if ( ! msg.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
			msg.channel.send('Only people with \`ADMINISTRATOR\` permission can set the notification channel.');
		} else {
			Persist.channel[msg.guild.id] = msg.channel.id;
			Persist.ready[msg.guild.id] = true;
			savePersist();
			if ( ! msg.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
			msg.channel.send('Notification channel is successfully set.');
		}
	}
});



client.on('guildCreate', (guild) => {
	Persist.ready[guild.id] = false;
	savePersist();
	let channel = guild.channels.find(chan => {
		if (chan.type != 'text') return false;
		return chan.permissionsFor(client.user).has('SEND_MESSAGES');
	});
	if (channel) {
		channel.send({embed: {
			author: {
				name: client.user.username,
				icon_url: client.user.displayAvatarURL()
			},
			title: `Hi, thanks for adding ${client.user.username}.`,
			description: `To activate the bot, someone with \`ADMINISTRATOR\` permission must set the notification channel `
				+ `by using \`${Config.prefix}setChannel\` at the desired channel.`,
			footer: {text: `Use \`${Config.prefix}help\` for more details.`}
		}});
	}
});



client.on('error', (err) => {
	console.error(err);
	console.log('Client error occured: ' + new Date());
});
process.on('uncaughtException', function (err) {
	console.error(err);
	console.log("Exiting due to uncaught exception: " + new Date());
	process.exit(1);
});
process.on('unhandledRejection', function(err) {
	console.error(err);
});



client.login(token);
