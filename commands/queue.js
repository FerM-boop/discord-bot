const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Shows the current queue'),
	execute: async ({ interaction }) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply('You must be in a voice channel to use this command.');
			return;
		}

		const queue = useQueue(interaction.guild.id);
		const tracks = queue.tracks.toArray();
		const embed = new EmbedBuilder()
			.setDescription(`Playing right now: **[${queue.currentTrack.title}](${queue.currentTrack.url})** \n Rest of the queue: \n **${tracks.join('\n')}**`)
			.setThumbnail(queue.currentTrack.thumbnail);

		await interaction.reply({ embeds: [embed] });
	},
};