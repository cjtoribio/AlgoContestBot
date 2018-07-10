
# AlgoContestBot v0.2.0

## About
AlgoContestBot notifies you about upcoming algorithmic programming contests.
After the notification channel is set, the bot will notify you **48**, **24** and **2** hours before an upcoming contest.
#### Currently supported contest platforms:
* [CodeForces](https://codeforces.com)
* [HackerRank](https://hackerrank.com)
* [CSAcademy](https://csacademy.com)
* [CodeChef](https://codechef.com)
* [HackerEarth](https://hackerearth.com)

This bot uses [CodeForces API](http://codeforces.com/api/help) and [clist.by API](https://clist.by/api/v1/doc/).

## Installation

**Node.js version >= 8.0.0 must be installed.**
Run `npm install` inside the project folder.

## Usage
#### Running the bot
Create an `auth.json` file inside the project folder that contains this:
```js
{
	"token": "your-discord-bot-token-here",
	"clistbyUsername": "your-clist.by-username",
	"clistbyAPIKey": "your-clist.by-apikey"
}
```
You will need a [clist.by](clist.by) account for the bot to fetch data using [clist.by API](https://clist.by/api/v1/doc/) successfully.

Then run `npm start` inside the project folder.

If you want to `eval` commands, fill in your Discord User ID as value for `owner` in `config.json` and restart the bot. The bot will then accept `_eval` commands from DMs from you.

#### How to set the notification channel?
Someone with `ADMINISTRATOR` permission must use the `_setChannel` command on the desired channel.
