const {SlashCommandBuilder} = require('discord.js');
const { client } = require("/usr/src/app/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test command'),
    async execute(interaction) {
        interaction.reply('Pong!') //this file used for testing, probably will show multiple changes for little things.
    },
};