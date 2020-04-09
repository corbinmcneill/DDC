require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});

const Discord = require('discord.js');
const bot = new Discord.Client();

const randomColor = require('randomcolor');

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
	if (newPres && newPres.member && newPres.member.voice.channel){
		updateChannel(oldPres.member.voice.channel);
	}

	if(oldPres && oldPres.member && oldPres.activities.length > 0) {
		var oldActivity = oldPres.activities[0].name;
		oldPres.guild.roles.fetch().then( roles => {
			oldRole = roles.cache.find(role => role.name === oldActivity);
			if (oldRole) {
				oldPres.member.roles.remove(oldRole);
			}
		}).catch(console.error);
	}

	if (newPres && newPres.member && newPres.activities.length >0 && ( newPres.activities[0].type === "PLAYING" || newPres.activities[0].type === "STREAMING")) {
		var newActivity = newPres.activities[0].name;
		newRoleP = oldPres.guild.roles.fetch().then(roles => roles.cache.find(role => role.name === newActivity)).catch(console.error);
		newRoleP.then( newRole => {
			if (newRole) {
				newPres.member.roles.add(newRole)}
			else {
				var roleOpts = {data: {name: newActivity,
				                   	   color: randomColor({luminosity: 'light'}),
				                   	   hoist: true,
				                   	   permissions: 0
				                  	  }};
				newPres.guild.roles.create(roleOpts).then( newRole => newPres.member.roles.add(newRole).catch(console.error) ).catch(console.error);
			}
		}).catch(console.error);
	}
}

function updateChannel(channel){
	console.log(`checking the channel ${channel.name}`);

	var activeUsers = 0;
	var activityFrequency = new Map();
	for (member of channel.members.values()) {
		if (member.voice.selfDeaf) {
			continue;
		}

		activeUsers++;

		if (member.presence && member.presence.activities && member.presence.activities.length !== 0 && member.presence.activities[0]) {
			var activity = member.presence.activities[0].name;
			if (activityFrequency.has(activity)) {
				activityFrequency.set(activity, activityFrequency.get(activity)+1);
			}
			else {
				activityFrequency.set(activity, 1);
			}
		}
	}

	console.log(`activeUsers = ${activeUsers}`);
	if (activeUsers === 0) {
		channel.setName("Nothing");
		return;
	}

	for (activity of activityFrequency.keys()) {
		console.log(`${activity} has frequency ${activityFrequency.get(activity)}`)

		if (activityFrequency.get(activity) === activeUsers) {
			channel.setName(`${activity}`);
			return;
		}
		else if (activityFrequency.get(activity) * 2 > activeUsers) {
			channel.setName(`Mostly ${activity}`);
			return;
		}
	}

	channel.setName("Hanging Out");
}

bot.login(token);
