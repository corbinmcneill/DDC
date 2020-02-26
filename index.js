//require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = process.env.CLIENT_TOKEN;

bot.on("ready", function(){
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("voiceStateUpdate", function(oldMember, newMember){
	console.log(`starting voice state update`);

    if (oldMember.voiceChannel){
    	updateChannel(oldMember.voiceChannel);
    }
    if (newMember.voiceChannel){
    	updateChannel(newMember.voiceChannel);
    }

    console.log(`ended voice state update`);
});

bot.on("presenceUpdate", function(oldMember, newMember){
	console.log(`starting presence update`);

	if (oldMember.voiceChannel){
    	updateChannel(oldMember.voiceChannel);
    }
    if (newMember.voiceChannel){
    	updateChannel(newMember.voiceChannel);
    }

    console.log(`finished presence update`);
})

function updateChannel(channel){
	console.log(`checking the channel ${channel.name}`);

	var activeUsers = 0;
	var gamingUsers = 0
	var gameFrequency = new Map();
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
