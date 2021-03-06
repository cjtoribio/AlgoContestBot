const sf = require('snekfetch');
const Notify = require(global.dirname + '/notify/notify.js');

let list = [];
const doNotify = (res) => {
	list.forEach(obj => {
		const startTime = new Date(parseInt(obj.startTimeSeconds)*1000);
		const rtime = -obj.relativeTimeSeconds;
		if (rtime <= 2*60*60) {
			Notify.notify(res, obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, startTime, rtime, 2);
		} else if (rtime <= 24*60*60) {
			Notify.notify(res, obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, startTime, rtime, 12);
		} else if (rtime <= 2*24*60*60) {
			// Notify.notify(res, obj.id, obj.name, `https://codeforces.com/contests/${obj.id}`, startTime, rtime, 48);
		}
	});
}
let errorTolerance = 5;
const fetch = () => {
	sf.get('http://codeforces.com/api/contest.list')
	.then(res => {
		if (res.body.status === 'OK') {
			list = res.body.result.filter(obj => obj.phase === 'BEFORE');
			if (errorTolerance <= 0) {
				Notify.tellEveryone("CodeForces API works again.");
			}
			errorTolerance = 5;
			doNotify('codeforces.com');
		} else {
			errorTolerance--;
			if (errorTolerance === 0) {
				Notify.tellEveryone("CodeForces API isn't accessible at the moment. Please check other sources until it works again.");
			}
		}
	}).catch(err => {
		errorTolerance--;
		if (errorTolerance === 0) {
			Notify.tellEveryone("CodeForces API isn't accessible at the moment. Please check other sources until it works again.");
		}
	});
	setTimeout(fetch, 1000*(60-new Date().getSeconds()));
}

module.exports.fetch = fetch;
