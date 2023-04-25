const { EmbedBuilder } = require('discord.js');
const { QueryType, useQueue } = require('discord-player');
const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song')
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName('search')
			.setDescription('Searches for a song.')
			.addStringOption(option =>
				option
					.setName('searchterms')
					.setDescription('search keywords')
					.setRequired(true),
			))
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName('playlist')
			.setDescription('Plays playlist from YouTube')
			.addStringOption(option =>
				option
					.setName('url')
					.setDescription('playlist url')
					.setRequired(true),
			))
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName('song')
			.setDescription('Plays song from YouTube')
			.addStringOption(option =>
				option
					.setName('url')
					.setDescription('song url')
					.setRequired(true),
			)),
	execute: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply('You must be in a voice channel to use this command.');
			return;
		}

		let queue = useQueue(interaction.guild.id);

		await interaction.deferReply();

		if (!queue) {
			queue = await client.player.nodes.create(interaction.guild);
		}

		if (!queue.connection) await queue.connect(interaction.member.voice.channel);

		const embed = new EmbedBuilder();

		if (await interaction.options.getSubcommand() === 'song') {
			const url = interaction.options.getString('url');
			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_VIDEO,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('no results found');
				return;
			}

			const song = result.tracks[0];
			queue.insertTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}
		else if (interaction.options.getSubcommand() === 'playlist') {
			const url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_PLAYLIST,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('no playlist found');
				return;
			}

			const playlist = result.playlist;
			queue.insertTrack(playlist);

			embed
				.setDescription(`Added **[${playlist.title}](${playlist.url})** to the queue.`)
				.setThumbnail(playlist.thumbnail)
				.setFooter({ text: `Duration: ${playlist.duration}` });
		}
		else if (interaction.options.getSubcommand() === 'search') {
			const url = interaction.options.getString('searchterms');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('no results found');
				return;
			}

			const song = result.tracks[0];
			queue.insertTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}
		if (!queue.isPlaying()) {
			await queue.node.play();
		}

		await interaction.editReply({ embeds: [embed] });
	},
};