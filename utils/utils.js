const istream = (str) => {
	return str.split(' ');
}
const consume = (arr) => {
	while (arr.length > 0 && arr[0].length === 0) arr.shift();
	if (arr.length > 0) return arr.shift();
	else return null;
}
const consumeRaw = (arr) => {
	while (arr.length > 0 && arr[0].length == 0) arr.shift();
	let ret = arr.join(' ');
	while (arr.length > 0) arr.shift();
	if (ret === '') ret = null;
	return ret;
}
const isend = (arr) => {
	let ret = true;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].length > 0) ret = false;
	}
	return ret;
}
const argcnt = (arr) => {
	let ret = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].length > 0) ret++;
	}
	return ret;
}

const formatDuration = (seconds) => {
	seconds = parseInt(seconds);
	if (isNaN(seconds) || seconds < 0) return '0s';
	let ret = (seconds >= 86400 ? Math.floor(seconds / 86400) + 'd ' : '');
	seconds %= 86400;
	ret += ((seconds >= 3600 || ret.length > 0) ? Math.floor(seconds / 3600) + 'h ' : '');
	seconds %= 3600;
	ret += ((seconds >= 60 || ret.length > 0) ? Math.floor(seconds / 60) + 'm ' : '');
	seconds %= 60;
	ret += seconds + 's';
	return ret;
}

module.exports.istream = istream;
module.exports.consume = consume;
module.exports.consumeRaw = consumeRaw;
module.exports.isend = isend;
module.exports.argcnt = argcnt;
module.exports.formatDuration = formatDuration;
