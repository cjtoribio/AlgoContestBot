
# AlgoContestBot v0.1.0

## About
AlgoContestBot notifies you about upcoming algorithmic programming contests.
After the notification channel is set, the bot will notify you **48**, **24** and **2** hours before an upcoming contest.
#### Currently supported contest platforms:
* [CodeForces](https://codeforces.com)

## Installation

**Node.js version >= 8.0.0 must be installed.**
Run `npm install` inside the project folder.

## Usage
#### Running the bot
Create an `auth.json` file inside the project folder that contains this:
```js
{
	"token": "your-secret-token-here"
}
```
Then run `npm start` inside the project folder.

If you want to `eval` commands, fill in your Discord User ID as value for `owner` in `config.json` and restart the bot. The bot will now accept `_eval` commands from DMs from you.

#### How to set the notification channel?
Someone with `ADMINISTRATOR` permission must use the `_setChannel` command on the desired channel.

## Contributing
Please branch from and issue pull requests to `develop` branch.