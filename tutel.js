const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const fs = require("node:fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const discordVoice = require("@discordjs/voice");
const config = require("./configtutel.json");
const https = require("https");

const tutels = [];

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

/**
 *
 * @param {discord.VoiceChannel} voiceChannel
 */
async function runtutel(voiceChannel) {
	if (voiceChannel == null || voiceChannel.guild.me.voice.channel) return;
	const connection = discordVoice.joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		selfDeaf: false,
	});
	const player = discordVoice.createAudioPlayer({
		behaviors: {
			noSubscriber: discordVoice.NoSubscriberBehavior.Play,
		},
	});


	connection.subscribe(player);
	if (config.RESPOND_ON_MEMBER_VOICE_STATE) {
		const speakingMap = connection.receiver.speaking;
		speakingMap.on("start", (userId) => {
			player.stop(true);
		});
		speakingMap.on("end", (userId) => {
			player.play(
				discordVoice.createAudioResource(tutels[getRandomInt(0, tutels.length)]),
				voiceChannel.id,
				voiceChannel.guild.id
			);
		});
	} else {
		player.play(
			discordVoice.createAudioResource(tutels[getRandomInt(0, tutels.length)]),
			voiceChannel.id,
			voiceChannel.guild.id
		);

		player.on("stateChange", (oldState, newState) => {
			if (
				newState.status === discordVoice.AudioPlayerStatus.Idle &&
				oldState.status !== discordVoice.AudioPlayerStatus.Idle
			) {
				setTimeout(() => {
					player.play(
						discordVoice.createAudioResource(tutels[getRandomInt(0, tutels.length)]),
						voiceChannel.id,
						voiceChannel.guild.id
					);
				}, getRandomInt(1, 4) * 1000);
			}
		});
	}
}

client.on("voiceStateUpdate", (oldState, newState) => {
	if (newState.member.user.bot) return;
	if (config.JOIN_AUTOMATICALLY && oldState.channel == null && newState.channel != null) {
		runBen(newState.channel);
	if (oldState.channelID !==  oldState.guild.me.voice.channelID || newState.channel)
		return;
	}
});

client.on("ready", (bot) => {
	fs.readdir("./tutels", (err, files) => {
		if (err) return console.error(err);
		files.forEach((file) => {
			tutels.push("./tutels/" + file);
		});
	});
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

if (commandName === 'join') {
    const voiceChannel = interaction.options.getChannel('vc');
    if (!voiceChannel) return interaction.reply("You should select a voice channel!").catch(() => {});
    runtutel(voiceChannel).catch(() => {})
interaction.reply(':white_check_mark:').catch(() => {});
  }
if (commandName === 'pic') {
    https.get("https://source.unsplash.com/featured/?turtle", (res) => {
interaction.reply({embeds: [
            {
                image: {
                    url: res.headers.location
                },
                title: "Here is your tutel!",
                color: 0x2ECC71 
            }
        ]}).catch(() => {});
    });
}
if (commandName === 'fact') {
const Facts = require("./turtlefacts.json");
let fact = Facts[Math.floor(Math.random() * Facts.length)];

interaction.reply({embeds: [
	{
		title: "Tutel Fact",
		description: fact[0],
		color: 0x2ECC71 
	}
]}).catch(() => {});
}
if (commandName === 'tutel') {
interaction.reply({embeds: [
	{
		title: "Commands List",
		description: "/tutel - Sends this message. \n/pic - Sends a random turtle pic. \n/fact - Sends a random turtle fact. \n/join - Joins the selected voice channel and plays random turtle sounds in it. (24/7) \n/leave - Leaves the voice channel!",
		color: 0x2ECC71
	}
]
}).catch(() => {});
}
if (commandName === 'leave') {
	const { getVoiceConnection } = require('@discordjs/voice')
    const connection = getVoiceConnection(interaction.guildId)
	if (connection) connection.destroy()
interaction.reply(":white_check_mark:").catch(() => {});
}
});

client.login("");
client.on('ready', () => {
    client.user.setActivity(`/tutel`, { type: 'WATCHING' });
    });
    client.on("warn", console.warn);
    client.on("error", console.error);