const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

//TODO: Finish profile grabbing here
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Return information about your profile'),
    async execute(interaction) {
        const exampleEmbed = new EmbedBuilder()
            .setColor("#00FFFF")
            .setTitle('Profile Information')
            .setURL('https://dwxenterprises.net/')
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage(user.avatarURL)
            .setTimestamp()
            .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        await interaction.reply({ embeds: [exampleEmbed] });
    },
};