const { SlashCommandBuilder, GuildMember} = require('discord.js');
const mariadb = require("mariadb");
const { client } = require("/usr/src/app/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
    .addStringOption(option =>
        option.setName('snowflake_id')
            .setDescription('ID of user to ban')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason why you wish to ban this user.')
                .setRequired(true)),
    async execute(interaction) {
        const mariadb = require('mariadb');
        const pool = mariadb.createPool({
            host: process.env.maria_host,
            user: process.env.maria_user,
            password: process.env.maria_pwd,
            connectionLimit: 5
        });

        //To audit logs for user info.
        pool.getConnection().then(conn => {
            let sqlRequest = `SELECT * FROM kaivax.discord_administrators WHERE snowflake = '${interaction.user.id}';`;
            let findAdminReq = conn.query(sqlRequest).then(async result => {
                let blacklistReasonClean = conn.escape(interaction.options.getString('reason'))
                let blacklistedByUsernameClean = conn.escape(interaction.user.username)
                let banUserDBQuery = `INSERT INTO kaivax.discord_blacklistedUsers (snowflake, blacklistedByID, blacklistReason, blacklistedByUsername) VALUES (`+interaction.options.getString('snowflake_id')+`, `+interaction.user.id+`, '`+blacklistReasonClean+`', '`+blacklistedByUsernameClean+`');`;
                await conn.query(banUserDBQuery);

                let banishedMember = client.members.cache.get(interaction.options.getString('snowflake_id'));
                console.log(banishedMember)
                await banishedMember.kick();
                interaction.reply('Banned user. They are no longer welcome here.')
            }).catch(err => {
                if(err.code === 'ER_DUP_ENTRY') {
                    interaction.reply('This user has already been banished. If they are currently in the server, they may need to be manually kicked. A possible error may have occured.')
                } else {
                    console.log(err)
                    interaction.reply('ERROR: You are not authorized to use this command.')
                }
            });
        });

    },
};