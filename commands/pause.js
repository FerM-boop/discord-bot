const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the queue'),
	execute: async ({ interaction }) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply('You must be in a voice channel to use this command.');
			return;
		}

		const queue = useQueue(interaction.guild.id);
		queue.node.setPaused(!queue.node.isPaused());

		const embed = new EmbedBuilder();

		if (queue.node.isPaused()) {
			embed
				.setDescription(`Paused **[${queue.currentTrack.title}](${queue.currentTrack.url})** from the queue.`)
				.setThumbnail(queue.currentTrack.thumbnail)
				.setFooter({ text: `Duration: ${queue.currentTrack.duration}` });
		}
		else {
			embed
				.setDescription(`Resumed **[${queue.currentTrack.title}](${queue.currentTrack.url})** from the queue.`)
				.setThumbnail(queue.currentTrack.thumbnail)
				.setFooter({ text: `Duration: ${queue.currentTrack.duration}` });
		}

		await interaction.reply({ embeds: [embed] });
	},
};