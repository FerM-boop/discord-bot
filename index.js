// Require the necessary discord.js classes

// reading msgs and music
const { Client, GatewayIntentBits, Collection } = require('discord.js');
// env var
const { config } = require('dotenv');
config();
// openai
const { Configuration, OpenAIApi } = require('openai');
// music
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Player } = require('discord-player');

const fs = require('node:fs');
const path = require('node:path');

// Different prefixes for different types of commands
const gptPrefix = '>>';

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

// List of all commands
const commands = [];
client.commands = new Collection();
// Pulls commands from each file
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Stores commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

// Player
client.player = new Player(client, {
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 25,
	},
});

// Loading the commands to each server channel everytime the bot runs
client.on('ready', async () => {
	const guild_ids = client.guilds.cache.map(guild => guild.id);

	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
	for (const guildId of guild_ids) {
		try {
			await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
			console.log('Successfully updated commands for guild ' + guildId);
		}
		catch (err) {
			console.error(err);
		}
	}
	console.log('Bot is online!');
	client.user.setActivity('Go outside lol', { type: 'WATCHING' });
});

// Autofill when typing '/command' in discord
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	// Gets command sent by the user
	const command = client.commands.get(interaction.commandName);

	if (!command) return;
	// Executes command
	try {
		await command.execute({ client, interaction });
	}
	catch (err) {
		console.error(err);
		await interaction.reply({ content: `There was an error executing this command ${err}` });
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