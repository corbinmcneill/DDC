//require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = process.env.CLIENT_TOKEN;
const categoryID  = process.env.CATEGORY_ID;

bot.on("ready", function(){
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("voiceStateUpdate", activityHandler);

bot.on("presenceUpdate", activityHandler);

function makeNewChannel(g) {
	console.log(`Trying to create new channel. categoryID: ${categoryID}`)
	g.createChannel('New Channel', {type: 'voice', parent: categoryID});
}

function activityHandler(oldMember, newMember) {
	if (oldMember.voiceChannel){
		if (oldMember.voiceChannel.members.size === 0) {
			oldMember.voiceChannel.delete();
			if (oldMember.guild.channels.filter(c => c.parentID === categoryID).size === 0) {
				makeNewChannel(oldMember.guild);
			}
		} else {
    		updateChannel(oldMember.voiceChannel);
    	}
    }
    if (newMember.voiceChannel){
    	if (newMember.voiceChannel.members.size === 1 && newMember.voiceChannel.name === `New Channel`) {
    		makeNewChannel(oldMember.guild);
    	}
    	updateChannel(newMember.voiceChannel);
    }
}

function updateChannel(channel){
	console.log(`checking the channel ${channel.name}`);

	var activeUsers = 0;
	var gamingUsers = 0
	var gameFrequency = new Map();
	console.log(`activeUsers = ${activeuUsers}`);
	console.log(`gamingUsers = ${gamingUsers}`);
	for (member of channel.members.values()) {
		var game = member.presence.game;
		if ( member.selfDeaf || member.serverDeaf) {
			continue;
		}
		else if (!game || game.name === 'Spotify') {
			activeUsers++;
		}
		else {
			activeUsers++;
			gamingUsers++;

			var gameName = game.name;
			if (gameFrequency.has(gameName)) {
				gameFrequency.set(gameName, gameFrequency.get(gameName)+1);
			}
			else {
				gameFrequency.set(gameName, 1);
			}
		}
	}

	if (activeUsers === 0) {
		channel.setName("Nothing");
		return;
	}

	for (gameName of gameFrequency.keys()) {
		console.log(`${gameName} has frequency ${gameFrequency.get(gameName)}`)

		if (gameFrequency.get(gameName) === gamingUsers) {
			channel.setName(`${gameName}`);
			return;
		}
		else if (gameFrequency.get(gameName) * 2 > gamingUsers) {
			channel.setName(`Mostly ${gameName}`);
			return;
		}
	}

	channel.setName("Hanging Out");
}

bot.login(token);
