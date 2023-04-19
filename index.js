// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions } = require('discord.js');
const { config } = require('dotenv');

const prefix = '>' ;

config();

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.on('ready', () => {
	console.log('Bot is online!');

	client.user.setActivity('Go outside lol', { type: 'WATCHING' });
});

client.on('messageCreate', (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	// message array

	const messageArray = message.content.split(' ');
	const argument = messageArray.slice(1);
	const cmd = messageArray[0];

	// COMMANDS

	if (command === 'hello') {
		message.channel.send(`Hello! ${message.author}`);
	}
});

client.login(process.env.TOKEN);