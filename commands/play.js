const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const playDL = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('Searches for a song and plays it')
        .addStringOption((option) =>
          option
            .setName('searchterms')
            .setDescription('search keywords')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('playlist')
        .setDescription('Plays a playlist from YT')
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription("the playlist's URL")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('song')
        .setDescription('Plays a single song from YT')
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription("the song's URL")
            .setRequired(true)
        )
    ),
  execute: async ({ client, interaction }) => {
    // Ensure the user is in a voice channel
    if (!interaction.member.voice.channel)
      return interaction.reply(
        'You need to be in a Voice Channel to play a song.'
      );

    // Create or retrieve the play queue for the server
    const queue = await client.player.queues.create(interaction.guild);

    // Ensure the bot is connected to the voice channel
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = {};

    // Song command: plays a specific song from a URL
    if (interaction.options.getSubcommand() === 'song') {
      let url = interaction.options.getString('url');

      try {
        // Get the stream info from play-dl
        const stream = await playDL.stream(url);
        const song = {
          title: stream.video_details.title,
          url: stream.video_details.url,
          duration: stream.video_details.durationRaw,
          thumbnail: stream.video_details.thumbnails[0].url,
        };

        // Add the track to the queue
        await queue.addTrack(song);

        embed = {
          description: `**[${song.title}](${song.url})** has been added to the Queue`,
          thumbnail: {
            url: song.thumbnail,
          },
          footer: {
            text: `Duration: ${song.duration}`,
          },
        };
      } catch (error) {
        console.error('Error streaming the song:', error);
        return interaction.reply(
          'An error occurred while trying to play the song.'
        );
      }
    }
    // Playlist command: plays an entire playlist from a URL
    else if (interaction.options.getSubcommand() === 'playlist') {
      let url = interaction.options.getString('url');

      try {
        const playlist = await playDL.get_playlist_info(url);
        const tracks = await playDL.get_playlist(url);
        await queue.addTracks(tracks);

        embed = {
          description: `**${tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`,
          thumbnail: {
            url: playlist.thumbnails[0].url,
          },
        };
      } catch (error) {
        console.error('Error retrieving the playlist:', error);
        return interaction.reply(
          'An error occurred while trying to retrieve the playlist.'
        );
      }
    }
    // Search command: searches YouTube for a song based on keywords
    else if (interaction.options.getSubcommand() === 'search') {
      let url = interaction.options.getString('searchterms');

      try {
        const searchResult = await playDL.search(url, { limit: 1 });
        if (searchResult.length === 0)
          return interaction.reply('No results found.');

        const song = searchResult[0];
        await queue.addTrack(song);

        embed = {
          description: `**[${song.title}](${song.url})** has been added to the Queue`,
          thumbnail: {
            url: song.thumbnail,
          },
          footer: {
            text: `Duration: ${song.duration}`,
          },
        };
      } catch (error) {
        console.error('Error searching for the song:', error);
        return interaction.reply(
          'An error occurred while trying to search for the song.'
        );
      }
    }

    // Start playing the queue if it's not already playing
    if (!queue.playing) await queue.play();

    // Send the response with the embed information
    await interaction.reply({ embeds: [embed] });
  },
};
