const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the current queue'),
	execute: async ({ interaction }) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply('You must be in a voice channel to use this command.');
			return;
		}

		const queue = useQueue(interaction.guild.id);
		queue.delete();

		await interaction.reply('Queue has been stopped successfully');
	},
};