const { REST, Routes } = require('discord.js');
require('dotenv').config();  // Zorg ervoor dat de .env variabelen geladen worden
const fs = require('fs');

// Haal de clientId, guildId en token uit je .env bestand
const clientId = process.env.clientId;
const guildId = process.env.guildId;
const token = process.env.BOT_TOKEN;

// Maak een array voor de commando's
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Lees alle commando bestanden en voeg ze toe aan de commands array
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// Maak een nieuwe REST client om commando's te registreren
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Begonnen met het registreren van de slash commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),  // Registreer de commando's voor je server
      { body: commands },
    );

    console.log('Slash commands succesvol geregistreerd.');
  } catch (error) {
    console.error(error);
  }
})();
