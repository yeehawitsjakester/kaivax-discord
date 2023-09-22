const { SlashCommandBuilder, GuildMember, EmbedBuilder} = require('discord.js');
const mariadb = require("mariadb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addyt')
        .setDescription('Add a new YouTube feed to be published to a designated channel on new media')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Youtube channel URL')
                .setRequired(true)),

    async execute(interaction) {
        const { client } = require("/usr/src/app/index.js");
        const addYouTubeRSS = require("/usr/src/app/addons/youtubeFeed/rss-yt.js")
        let youtubeRSSaddStatus = addYouTubeRSS(interaction.options.getString('url'))

        console.log(youtubeRSSaddStatus)

        if(youtubeRSSaddStatus === true) {
            const YoutubeRSSSuccessMsg = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("New Youtube channel added to feed!")
                .setDescription("The YouTube channel at "+interaction.options.getString('url')+" has been added to the RSS listening feed. New videos uploaded will now be sent to channel ID: "+global.configurator.annoucementsChannel)
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            interaction.reply({ embeds: [YoutubeRSSSuccessMsg]});
        } else {
            console.log
            const YoutubeRSSFailedMsg = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Failed to add YouTube channel to feed!")
                .setDescription("The YouTube channel at "+interaction.options.getString('url')+" could not be added. Please contact an administrator")
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            interaction.reply({ embeds: [YoutubeRSSFailedMsg]});
        }
    }
};