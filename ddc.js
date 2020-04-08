require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = process.env.CLIENT_TOKEN;
const categoryID  = process.env.CATEGORY_ID;

bot.on("ready", function(){
  console.info(`Logged in as ${bot.user.tag}!`);
});


function makeNewChannel(g) {
	console.log(`Trying to create new channel. categoryID: ${categoryID}`)
	g.channels.create('New Channel', {type: 'voice', parent: categoryID});
}

bot.on("voiceStateUpdate", voiceStateHandler);
function voiceStateHandler(oldVS, newVS) {
	if (oldVS && oldVS.channel){
		if (oldVS.channel.members.size === 0) {
			oldVS.channel.delete();
		} else {
			updateChannel(oldVS.channel);
		}
	}
	if (newVS && newVS.channel){
		if (newVS.channel.name === `New Channel`) {
			makeNewChannel(newVS.guild);
		}
		updateChannel(newVS.channel);
	}
}

bot.on("presenceUpdate", presenceHandler);
function presenceHandler(oldPres, newPres) {
	if (oldPres && oldPres.member && oldPres.member.voice && oldPres.member.voice.channel){
		updateChannel(oldPres.member.voice.channel);
	}
}

function updateChannel(channel){
	console.log(`checking the channel ${channel.name}`);

	var activeUsers = 0;
	var activityFrequency = new Map();
	console.log(`activeUsers = ${activeUsers}`);
	for (member of channel.members.values()) {
		if (member.presence.activities.length === 0 || member.voice.selfDeaf) {
			continue;
		}

		activeUsers++;

		var activity = member.presence.applications[0].name;
		if (activityFrequency.has(gameName)) {
			activityFrequency.set(activity, activityFrequency.get(gameName)+1);
		}
		else {
			activityFrequency.set(activity, 1);
		}
	}

	if (activeUsers === 0) {
		channel.setName("Nothing");
		return;
	}

	for (gameName of activityFrequency.keys()) {
		console.log(`${gameName} has frequency ${activityFrequency.get(gameName)}`)

		if (activityFrequency.get(gameName) === gamingUsers) {
			channel.setName(`${gameName}`);
			return;
		}
		else if (activityFrequency.get(gameName) * 2 > gamingUsers) {
			channel.setName(`Mostly ${gameName}`);
			return;
		}
	}

	channel.setName("Hanging Out");
}

bot.login(token);
