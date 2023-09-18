const { Events, Routes, EmbedBuilder, Guild} = require('discord.js');
const { client } = require("/usr/src/app/index.js");

module.exports = {
    name: Events.ChannelDelete,
    once: false,
    async execute(channel) {

        let auditLog = await channel.guild.fetchAuditLogs({limit: 1})
        let fetchOwner = auditLog.entries.first().executor

        const channelDeleted = new EmbedBuilder()
            .setColor('#fffe00')
            .setTitle('Channel Deleted')
            .addFields(
                { name: 'Channel ID', value: channel.id},
                { name: 'Channel Name', value: channel.name},
                { name: 'Deleted By', value: fetchOwner.globalName },
                //english is not my first language, i hearby make Deletors a word now
                { name: 'Deletors Snowflake ID', value: fetchOwner.id},
            )
            .setTimestamp()
            .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
        const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
        alarmChannel.send({embeds: [channelDeleted]})
    },
};