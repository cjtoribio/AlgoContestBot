const fs = require('fs');
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
		ready: {},
		channel: {}
	}, null, 2));
}
const Persist = JSON.parse(fs.readFileSync(__dirname + '/persist.json', 'utf8'));
const savePersist = () => {
	fs.writeFileSync(__dirname + '/persist.json', JSON.stringify(Persist, null, 2));
}
global.dirname = __dirname;
global.client = client;
global.Persist = Persist;
global.savePersist = savePersist;

const CodeForces = require(__dirname + '/codeforces/codeforces.js');
const Clistby = require(__dirname + '/clistby/clistby.js');


client.on('ready', () => {
	console.log('Started running: ' + new Date());
	CodeForces.fetch();
	Clistby.fetch('hackerrank.com');
	Clistby.fetch('csacademy.com');
	Clistby.fetch('codechef.com');
	Clistby.fetch('hackerearth.com');
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
		if ( ! Utils.isend(is)) {
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
						value: `CodeForces\nHackerRank\nCSAcademy\nCodeChef\nHackerEarth`
					}
				]
			}});
		}
	} else if (cmd === 'setChannel') {
		if ( ! Utils.isend(is)) {
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
