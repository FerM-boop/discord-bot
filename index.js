// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, IntentsBitField } = require('discord.js');
const { config } = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

const prefix = '>' ;
const gptPrefix = '>>';

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

	// Hello cmd
	if (command === 'hello') {
		message.channel.send(`Hello! ${message.author}`);
	}
});

// GPT 3.5 Integration
const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
	if (!message.content.startsWith(gptPrefix) || message.author.bot || message.content.startsWith('!')) return;

	const prompt = message.content.slice(gptPrefix.length);

	const conversationLog = [{
		role: 'system',
		content: 'You are a friendly chatbot.',
	}];

	conversationLog.push({
		role: 'user',
		content: prompt,
	});

	await message.channel.sendTyping();

	const result = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: conversationLog,
	});

	message.reply(result.data.choices[0].message.content);
});

client.login(process.env.TOKEN);