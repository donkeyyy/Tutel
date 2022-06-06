const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, MessageAttachment, Modal, TextInputComponent } = require('discord.js');
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
		runtutel(newState.channel);
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
	const { getVoiceConnection } = require('@discordjs/voice');
    const connection = getVoiceConnection(interaction.guildId);
	if (connection) return interaction.reply("I'm already in a voice channel, please try again later when I'm free!");
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("CONNECT")) return interaction.reply("I don't have permissions to join the selected voice channel!").catch(() => {});
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("SPEAK")) return interaction.reply("I don't have permissions to speak in the selected voice channel!").catch(() => {});
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("VIEW_CHANNEL")) return interaction.reply("I don't have permissions to join the selected voice channel!").catch(() => {});
    runtutel(voiceChannel).catch(() => {});
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
	if (!connection) return interaction.reply("I'm not in a voice channel!");
	if (connection) connection.destroy()
interaction.reply(":white_check_mark:").catch(() => {});
}
if (commandName === 'wiki') {
	const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('select')
        .setPlaceholder('Select A Wiki Category')
        .addOptions([
          {
            label: 'Turtle, tortoise, or terrapin',
            emoji: '<:turtlepls:979452867935105044>',
            value: 'first_option',
          },
          {
            label: 'Ecology and life history',
            emoji: '<:turtlepls:979452867935105044>',
            value: 'second_option',
          },
          {
            label: 'Anatomy',
            emoji: '<:turtlepls:979452867935105044>',
            value: 'third_option',
          },
          {
            label: 'Evolution',
            emoji: '<:turtlepls:979452867935105044>',
            value: 'fourd_option',
          },
          {
            label: 'Something more..',
            emoji: '<:turtlepls:979452867935105044>',
            value: 'fiveth_option',
          },
        ]),
    );
	const embedmain = new MessageEmbed()
    .setColor(0x2ECC71)
    .setDescription("Everything you need to know about the turtles is right here!")
    .setTimestamp(new Date());
  await interaction.reply({ embeds: [embedmain], components: [row] }).catch(() => {});

  const filter = (interaction) => {
    return interaction.customId === "select";
  };

  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "select") {
      const selectedValue = interaction.values[0];
      if (selectedValue === "first_option") {
        const embed = new MessageEmbed()
          .setColor(0x2ECC71)
          .addFields({ name: 'Turtle, tortoise, or terrapin', value: 'Although the word turtle is widely used to describe all members of the order Testudines, it is also common to see certain members described as terrapins, tortoises or sea turtles, as well. How these names are used depends on the type of English. British English describes these reptiles as turtles if they live in the sea; terrapins if they live in fresh water; or tortoises if they live on land. American English tends to use the word turtle as a general term for all species. "Tortoise" is used for most land-dwelling species, and oceanic species are usually referred to as sea turtles. The name "terrapin" is not as commonly heard. Australian English uses turtle for both the marine and freshwater species, but tortoise for the terrestrial species. To avoid confusion, the word "chelonian" is popular among some who work with these animals, as a catch-all name. Unfortunately, Chelonia is also the name of a particular genus of turtles, so this conflicts with its use for the entire order Testudines.' })
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
      }
      if (selectedValue === "second_option") {
        const embedtwo = new MessageEmbed()
          .setColor(0x2ECC71)
          .setDescription("**Ecology and life history** \nAlthough many turtles spend much of their lives underwater, all turtles and tortoises breathe air, and must surface at regular intervals to refill their lungs. Some spend their whole lives on dry land. Aquatic respiration in Australian freshwater turtles is being studied. Some species have large cloacal (the hole used for mating and excretion) holes that are lined with many finger-like projections. These projections, called papillae, have a rich blood supply, and increase the surface area of the cloaca. The turtles can take up oxygen from the water using these papillae, in much the same way that fish use gills to take in oxygen. Like other reptiles, turtles lay eggs which are slightly soft and leathery. The eggs of the largest species are spherical, while the eggs of the rest are more shaped like chicken eggs. Sea turtles lay their eggs on dry, sandy beaches. Turtles can take many years to reach breeding age, and in many cases breed every few years rather than annually. In some species, there is temperature-dependent sex determination. Temperature determines whether an egg develops into a male or a female: a higher temperature causes a female, a lower temperature causes a male. Large numbers of eggs are deposited in holes dug into mud or sand. They are then covered and left to incubate by themselves. When the turtles hatch, they squirm their way to the surface and head toward the water. No turtle mother cares for its young.")
          .addFields({ name: 'Long-lived', value: 'Researchers have recently discovered a turtle’s organs do not gradually break down or become less efficient over time, unlike most other animals. It was found that the liver, lungs, and kidneys of a century old turtle are almost identical with that of a younger one. This has inspired genetic researchers to begin examining turtle genetics for longevity ( living a long time) genes.'})
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtwo], ephemeral: true }).catch(() => {});
      }
      if (selectedValue === "third_option") {
        const embedthree = new MessageEmbed()
          .setColor(0x2ECC71)
          .setDescription("**Anatomy**")
          .addFields({ name: 'Neck folding', value: 'Turtles are divided into two groups, according to how they evolved a solution to the problem of withdrawing their necks into their shells. The Cryptodira (hidden neck) can draw their necks in while contracting it under their spine. The Pleurodira (side neck), now found only in fresh water environments in the Southern hemisphere, contract their necks to the side. So, the important adaptation of head withdrawing evolved twice from ancestral turtles which did not have this ability.' }, 
          { name: 'Feeding', value: 'Turtles have a hard beak. Turtles use their jaws to cut and chew food. Instead of teeth, the upper and lower jaws of the turtle are covered by horny ridges. Carnivorous turtles usually have knife-sharp ridges for slicing through their prey. Herbivorous turtles have serrated-edged ridges that help them cut through tough plants. Turtles use their tongues to swallow food, but they cannot, unlike most reptiles, stick out their tongues to catch food.' },
          { name: 'Shell', value: 'The upper shell of the turtle is called the carapace. The lower shell that encases the belly is called the plastron. The carapace and plastron are joined together on the turtles sides by bony structures called bridges. The inner layer of a turtles shell is made up of about 60 bones. It includes parts of the spine and ribs, meaning the turtle cannot crawl out of its shell.' }, 
          { name: 'Largest living', value: 'The largest chelonian is a marine turtle, the great leatherback sea turtle, which reaches a shell length of 200 cm (80 inches) and can reach a weight of over 900 kg (2,000 lb, or 1 ton). Freshwater turtles are generally smaller, but with the largest species, the Asian softshell turtle Pelochelys cantorii, a few individuals have been reported to measure up to 200 cm or 80 in (Das, 1991). This is bigger then even the better-known alligator snapping turtle, the largest chelonian in North America, which attains a shell length of up to 80 cm (31½ in) and a weight of about 60 kg (170 lb). The lagest fossil turtle, Archelon, was more than twice the length of the leatherback, at up to 4.5 metres.' }
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedthree], ephemeral: true }).catch(() => {});
      }
      if (selectedValue === "fourd_option") {
        const embedfour = new MessageEmbed()
          .setColor(0x2ECC71)
          .setDescription("**Evolution** \nThe first fossil proto-turtles come from Upper Triassic of the Mesozoic era, about 220 million years ago. Their shell evolved from bony extensions of their backbones and broad ribs that expanded and grew together to form a complete shell. It offered protection at every stage of its evolution, even when the bony component of the shell was not complete. This proved a long-lasting adaptation, and the group as a whole has survived many changes in the seas, and several extinction events. Fossils of the freshwater Odontochelys semitestacea or half-shelled turtle with teeth, from the later Triassic, have been found in southwest China. Odontochelys displays a complete bony plastron and an incomplete carapace, similar to an early stage of turtle embryonic development. By the Upper Jurassic, turtles had radiated widely, and their fossil history becomes easier to read. Their exact ancestry has been a puzzle. Early amniotes had no openings in the skull behind the eyes. Openings developed in both Sauropsid and Synapsid skulls. They made the skull lighter, gave attachment points for muscles, and gave room for muscle bulges. But turtles do not have these skull openings. They were called anapsids, meaning no openings. Eventually it was suggested that turtles evolved from sauropsids which had skull openings, but turtles lost them as part of their evolution towards heavy defensive armour.")
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedfour], ephemeral: true }).catch(() => {});
      }
      if (selectedValue === "fiveth_option") {
      const embedfive = new MessageEmbed()
      .setColor(0x2ECC71)
      .setDescription("**Something more..** \nTurtles have appeared in myths and folktales around the world. Some terrestrial and freshwater species are widely kept as pets. Turtles have been hunted for their meat, for use in traditional medicine, and for their shells. Sea turtles are often killed accidentally as bycatch in fishing nets. Turtle habitats around the world are being destroyed. As a result of these pressures, many species are threatened with extinction.")
      .setTimestamp(new Date());
      await interaction.reply({ embeds: [embedfive], ephemeral: true }).catch(() => {});
      }
    }
  })
}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	if (interaction.commandName === 'suggestion') {
		const modal = new Modal()
			.setCustomId('myModal')
			.setTitle('Suggestions Form');
		const TitleInput = new TextInputComponent()
			.setCustomId('Input1')
			.setLabel("Title")
			.setStyle('SHORT');
		const DescriptionInput = new TextInputComponent()
			.setCustomId('Input2')
			.setLabel("Description")
			.setStyle('PARAGRAPH');
		const firstActionRow = new MessageActionRow().addComponents(TitleInput);
		const secondActionRow = new MessageActionRow().addComponents(DescriptionInput);
		modal.addComponents(firstActionRow, secondActionRow);
		await interaction.showModal(modal);
	}
});

client.on('interactionCreate', interaction => {
	if (!interaction.isModalSubmit()) return;
	
	const Title = interaction.fields.getTextInputValue('Input1');
	const Description = interaction.fields.getTextInputValue('Input2');
	const channel = client.channels.cache.get('979674985612337166');
	channel.send(`Title: ${Title} \nDescription: ${Description}`);
  interaction.reply({ content: 'Suggestion successfully submitted!', ephemeral: true });
});


client.login("");
client.on('ready', () => {
    client.user.setActivity(`/tutel`, { type: 'WATCHING' });
    });
    client.on("warn", console.warn);
    client.on("error", console.error);
