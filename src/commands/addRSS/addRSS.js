const { SlashCommandBuilder, GuildMember, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrss')
        .setDescription('Add a new RSS feed to be published to your updates channel upon new posts')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('RSS Feed URL. Needs to be a direct link to the XML file. See documentation for more info.')
                .setRequired(true)),

    async execute(interaction) {
        const { client } = require("/usr/src/app/index.js");
        const { addStandardRSS } = require("/usr/src/app/addons/rss/rss.js")

        let rssAddStatus = await addStandardRSS(interaction.options.getString('url'));

            if(rssAddStatus === true) {
                console.log(rssAddStatus)
                const RSSSuccessMsg = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("Added new RSS feed source!")
                    .setDescription("An RSS feed link at "+interaction.options.getString('url')+" has been added to the RSS listening feed. New posts will now be sent to channel ID: "+global.configurator.annoucementsChannel)
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                interaction.reply({ embeds: [RSSSuccessMsg]});
            } else {
                console.log(rssAddStatus)
                const RSSFailedMsg = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Failed to add RSS source feed!")
                    .setDescription("The RSS Feed at "+interaction.options.getString('url')+" could not be added. Please contact an administrator")
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                interaction.reply({ embeds: [RSSFailedMsg]});
            }

    }
};