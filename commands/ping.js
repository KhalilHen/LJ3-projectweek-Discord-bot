const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')  // De naam van het commando
    .setDescription('Geeft een pong reactie terug!'),  // Beschrijving van het commando
  async execute(interaction) {
    await interaction.reply('Pong!');  // Wat er gebeurt als het commando wordt uitgevoerd
  },
};
