const { Events, Routes, EmbedBuilder, Client} = require('discord.js');
const { client, configurator } = require("/usr/src/app/index.js");
const mariadb = require("mariadb");

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const mariadb = require('mariadb');
        const pool = mariadb.createPool({
            host: process.env.maria_host,
            user: process.env.maria_user,
            password: process.env.maria_pwd,
            connectionLimit: 5
        });

        //To audit logs for user info.
        pool.getConnection().then(conn => {
            let sqlRequest = `SELECT * FROM kaivax.discord_blacklistedUsers WHERE snowflake = '${member.user.id}';`;
            let sqlResult = conn.query(sqlRequest).then(async result => {
                const guildMemberJoinedAlertBlacklist = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle(member.user.username+' attempted to join the server. They will be sent to Brazil.')
                    .addFields(
                        { name: 'User Global Name', value: member.user.globalName},
                        { name: 'User Handle', value: member.user.username},
                        { name: 'User ID', value: member.user.id.toString() },
                        { name: 'Is bot?', value: member.user.bot.toString() },
                        { name: 'Blacklisted', value: 'TRUE! Kicking user...'},
                        { name: 'Blacklisted by', value: result[0].blacklistedByUsername},
                        { name: 'Blacklist Reason', value: result[0].blacklistReason}
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [guildMemberJoinedAlertBlacklist]})

                await member.kick();
            }).catch(async err => {
                //Not in blacklist
                console.log(err)
                const guildMemberJoinedAlert = new EmbedBuilder()
                    .setColor('#00ffff')
                    .setTitle(member.user.username + ' has joined the server.')
                    .addFields(
                        {name: 'User Global Name', value: member.user.globalName},
                        {name: 'User Handle', value: member.user.username},
                        {name: 'User ID', value: member.user.id.toString()},
                        {name: 'Is bot?', value: member.user.bot.toString()},
                        {name: 'Blacklisted', value: 'False'}
                    )
                    .setTimestamp()
                    .setFooter({
                        text: 'Built by YeehawItsJake',
                        iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg'
                    });

                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [guildMemberJoinedAlert]})
            });
        });
        if(member.user.id )
        if(global.configurator.enableGreeting === 'true') {
            const greetingChannel = await client.channels.fetch(global.configurator.greetingChannel)
            //We want to replace our template in the database that contains [joinUser] to the actual user and ping them.
            let regexTemplate2User = /joinUser/i;
            let greetingStringComplete = global.configurator.greetingString.replace(regexTemplate2User,'<@'+member.user.id.toString()+'>')
            greetingChannel.send(greetingStringComplete);
        }
    },
};