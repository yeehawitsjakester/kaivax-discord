const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test command'),
    async execute(interaction) {
        interaction.reply('PONG')
    },
};