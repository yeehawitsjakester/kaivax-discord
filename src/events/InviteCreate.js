const { Events, Routes, EmbedBuilder, Guild} = require('discord.js');
const { client } = require("/usr/src/app/index.js");

module.exports = {
    name: Events.InviteCreate,
    once: false,
    async execute(invite) {
        console.log(invite)
        let auditLog = await invite.guild.fetchAuditLogs({limit: 1})
        //for some odd reason, auditLog and fetchOwner need to be seperate, can't call them all at once
        let fetchOwner = auditLog.entries.first().executor

        /*
        const newChannelCreated = new EmbedBuilder()
            .setColor('#00d0ff')
            .setTitle('New Channel Created')
            .addFields(
                { name: 'Channel ID', value: channel.id},
                { name: 'Channel Name', value: channel.name},
                { name: 'NSFW Enabled?', value: channel.nsfw.toString() },
                { name: 'Created By', value: fetchOwner.globalName },
                { name: 'Creator Snowflake ID', value: fetchOwner.id},
            )
            .setTimestamp()
            .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
        const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
        alarmChannel.send({embeds: [newChannelCreated]})

         */
    },
};