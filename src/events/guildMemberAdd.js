const { Events, Routes, EmbedBuilder, Client} = require('discord.js');
const { client } = require("/usr/src/app/index.js");
const mariadb = require("mariadb");
//TODO: Add regex blacklist and check for certain characteristics in the profile
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
                await wait(500)
                let blacklistDM;
                if(result[0].blacklistMessage != null && result[0].blacklistMessage != undefined) {
                    client.users.send(member.user.id,result[0].blacklistMessage)
                    blacklistDM = result[0].blacklistMessage
                } else {
                    blacklistDM = 'You are not welcome at DWX Enterprises. Continued join attempts will be met with a kick. You have been blacklisted.';
                    client.users.send(member.user.id,blacklistDM)
                }
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
                        { name: 'Blacklist Reason', value: result[0].blacklistReason},
                        { name: 'BlacklistDM:', value: blacklistMessage}
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [guildMemberJoinedAlertBlacklist]})
                await member.kick();
            }).catch(async err => {
                //Not in blacklist. We should add them to our DB and scan the handle/name for sussy content (AboutMe content is needed, Discord. WHERE IS MY ABOUT ME INFORMATION, DISCORD!?)
                console.log(err)
                if(checkBlacklist(member.user.globalName)) {
                    const guildMemberJoinedAlertBlacklist = new EmbedBuilder()
                        .setColor('#ff6200')
                        .setTitle(member.user.username+' attempted to join the server with a forbidden item in their profile.')
                        .addFields(
                            { name: 'User Global Name', value: member.user.globalName},
                            { name: 'User Handle', value: member.user.username},
                            { name: 'User ID', value: member.user.id.toString() },
                            { name: 'Is bot?', value: member.user.bot.toString() },
                            { name: 'Blacklisted', value: 'False'},
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
                    const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                    alarmChannel.send({embeds: [guildMemberJoinedAlertBlacklist]})
                    await member.kick();
                } else {
                    if(global.configurator.enableGreeting === 'true') {
                        const greetingChannel = await client.channels.fetch(global.configurator.greetingChannel)
                        //We want to replace our template in the database that contains [joinUser] to the actual user and ping them.
                        let regexTemplate2User = /joinUser/i;
                        let greetingStringComplete = global.configurator.greetingString.replace(regexTemplate2User,'<@'+member.user.id.toString()+'>')
                        greetingChannel.send(greetingStringComplete);
                    }
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
                }
            });
        });
        function wait(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
        function checkBlacklist(queryString) {
            if(global.configurator.blacklistedProfileItems.some( v => queryString.includes(v))) {
                return true;
            } else {
                return false;
            }
        }
    },
};