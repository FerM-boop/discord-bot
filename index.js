// Require the necessary discord.js classes

// reading msgs and music
const { Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, IntentsBitField, Collection, Intents } = require('discord.js');
// env var
const { config } = require('dotenv');
// openai
const { Configuration, OpenAIApi } = require('openai');
// music
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Player } = require('discord-player');

const fs = require('node:fs');
const path = require('node:path');

// Different prefixes for different types of commands
const prefix = '>' ;
const gptPrefix = '>>';

config();

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
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

	// Hello cmd
	if (command === 'hello') {
		message.channel.send(`Hello! ${message.author}`);
	}
});

// GPT 3.5 Integration

// giving it the key
const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});

// initializing openai instance
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
	if (!message.content.startsWith(gptPrefix) || message.author.bot || message.content.startsWith('!')) return;

	const prompt = message.content.slice(gptPrefix.length);
	// starting state for the bot
	const conversationLog = [{
		role: 'system',
		content: 'You are a friendly chatbot.',
	}];

	conversationLog.push({
		role: 'user',
		content: prompt,
	});
	// makes bot appear as typing in discord
	await message.channel.sendTyping();

	// request made to openai selecting model and giving it context
	try {
		const result = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: conversationLog,
		});
		// respond to cmd message with the first answer
		message.reply(result.data.choices[0].message.content);
	}
	catch (err) {
		console.error(`ERROR: ${err}`);
		message.reply('There was an error with your request, please try again.');
	}
});

// giving the client the discord token
client.login(process.env.TOKEN);