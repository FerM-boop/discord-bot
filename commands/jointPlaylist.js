const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config } = require('dotenv');
config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jointplaylist')
		.setDescription('Creates a new playlist with each member\'s top tracks.')
		.addStringOption(option =>
			option
				.setName('timespan')
				.setDescription('Set time span for top tracks data.')
				.setRequired(true)
				.addChoices(
					{ name: 'All-Time', value: 'overall' },
					{ name: 'This Week', value: '7day' },
					{ name: 'Last Month', value: '1month' },
					{ name: 'Last 3 Months', value: '3month' },
					{ name: 'Last 6 Months', value: '6month' },
					{ name: 'Last Year', value: '12month' },
				),
		)
		.addIntegerOption(option =>
			option
				.setName('songsperuser')
				.setDescription('Songs to add per user.')
				.setRequired(true),
		),
	execute: async ({ client, interaction }) => {

		const timeSpan = interaction.options.getString('timespan');
		const songsPerUser = interaction.options.getInteger('songsperuser');
		const users = [process.env.LASTFM_USER1, process.env.LASTFM_USER2];

		const playlistBuilder = async () => {
			const array = [];
			const requests = [];
			for (const username of users) {
				const promise = new Promise((resolve, reject) => {
					client.lastFM.request('user.getTopTracks', {
						user: username,
						period: timeSpan,
						limit: songsPerUser,
						handlers: {
							success: function(data) {
								data.toptracks.track.forEach(element => {
									array.push(`- **${element.name}** ` + 'by' + ` ${element.artist.name}`);
								});
								resolve();
							},
							error: function(error) {
								console.log('Error: ' + error.message);
								reject(error);
							},
						},
					});
				});
				requests.push(promise);
			}
			await Promise.all(requests);
			return array;
		};
		const playlist = await playlistBuilder();
		const embed = new EmbedBuilder()
			.setColor('#6b34eb')
			.setTitle('Here\'s your *Joint* Playlist:')
			.setDescription(`${playlist.join('\n')}`);

		await interaction.reply({ embeds: [embed] });
	},
};