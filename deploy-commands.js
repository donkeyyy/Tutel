const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
	new SlashCommandBuilder().setName('tutel').setDescription('Sends the commands list and some info!'),
	new SlashCommandBuilder().setName('pic').setDescription('Sends a random turtle pic!'),
    new SlashCommandBuilder().setName('leave').setDescription('Leaves the voice channel!'),
	new SlashCommandBuilder().setName('fact').setDescription('Sends a random turtle fact!'),
    new SlashCommandBuilder().setName('join').setDescription('Makes the bot join a voice channel and play random turtle sounds!').addChannelOption(option =>
            option.setName('vc')
                .setDescription('Select a voice channel! (if you dont see it, enter its name)')
                .setRequired(true)),
]
.map(command => command.toJSON());

const clientId = ("")
const token = ("")
const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);