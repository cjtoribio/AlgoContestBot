const fs = require('fs');
const sf = require('snekfetch');
const Notify = require(global.dirname + '/notify/notify.js');
const { clistbyUsername } = JSON.parse(fs.readFileSync(global.dirname + '/auth.json', 'utf8'));
const { clistbyAPIKey } = JSON.parse(fs.readFileSync(global.dirname + '/auth.json', 'utf8'));



const doNotify = (res, list) => {
	list.forEach(obj => {
		const tmp = new Date(obj.start);
		const startTime = new Date(tmp.getTime()-tmp.getTimezoneOffset()*60*1000);
		const rtime = (startTime.getTime() - new Date().getTime()) / 1000;
		if (rtime <= 2*60*60) {
			Notify.notify(res, obj.id, obj.event, obj.href, startTime, rtime, 2);
		} else if (rtime <= 24*60*60) {
			Notify.notify(res, obj.id, obj.event, obj.href, startTime, rtime, 24);
		} else if (rtime <= 2*24*60*60) {
			Notify.notify(res, obj.id, obj.event, obj.href, startTime, rtime, 48);
		}
	});
}
let errorTolerance = 5;
const fetch = (resourceName) => {
	if ( ! clistbyUsername || ! clistbyAPIKey) {
		console.log("Can't access clist.by resources due to absence of username and/or apikey in auth.json");
		console.log("This means notfications will be limited to CodeForces contests.");
		console.log("Please fill in your clist.by credentials in auth.json");
		return;
	}
	const url = `https://clist.by/api/v1/json/contest/`
	+ `?start__gt=${encodeURIComponent(new Date().toISOString())}`
	+ `&resource__name=${resourceName}`
	+ `&username=${encodeURIComponent(clistbyUsername)}`
	+ `&api_key=${clistbyAPIKey}`;
	sf.get(url)
	.then(res => {
		if (res.body) {
			const list = res.body.objects;
			if (errorTolerance <= 0) {
				Notify.tellEveryone("clist.by API works again.");
			}
			errorTolerance = 5;
			doNotify(resourceName, list);
		} else {
			errorTolerance--;
			if (errorTolerance === 0) {
				Notify.tellEveryone("clist.by API isn't accessible at the moment. Please check other sources until it works again.");
			}
		}
	}).catch(err => {
		errorTolerance--;
		if (errorTolerance === 0) {
			Notify.tellEveryone("clist.by API isn't accessible at the moment. Please check other sources until it works again.");
		}
	});
	setTimeout(fetch, 1000*(60-new Date().getSeconds()), resourceName);
}

module.exports.fetch = fetch;
