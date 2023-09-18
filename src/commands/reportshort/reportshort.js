const {SlashCommandBuilder, EmbedBuilder, Client, GatewayIntentBits} = require('discord.js');
const { client } = require("/usr/src/app/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reportshort')
        .setDescription('Report a Shortlink')
        .addStringOption(option =>
            option.setName('shortcode')
                .setDescription('URL to shorten')
                .setRequired(true)),

    async execute(interaction) {
        const mariadb = require('mariadb');
        const pool = mariadb.createPool({
            host: process.env.maria_host,
            user: process.env.maria_user,
            password: process.env.maria_pwd,
            connectionLimit: 5
        });

        pool.getConnection().then(conn => {
            let shortcodeRequestClean = conn.escape(interaction.options.getString('shortcode'))
            let sqlRequest = `SELECT * FROM shlink.short_urls WHERE short_code = '${shortcodeRequestClean}';`;
            let sqlResult = conn.query(sqlRequest).then(async result => {

                const shortReportSuccess = new EmbedBuilder()
                    .setColor("#ff6700")
                    .setTitle("Shortlink Reported")
                    .setDescription("This shortlink has been reported to an administrator. Further action will be taken if this violates any rules including redirects to malicious content.")
                    .setTimestamp()
                    .setFooter({
                        text: 'Built by YeehawItsJake',
                        iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg'
                    });

                interaction.reply({embeds: [shortReportSuccess]});

                const adminShortlinkAlert = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Reported Shortlink")
                    .setDescription("A shortlink was reported by a user.")
                    .addFields(
                        {
                            name: 'Full Link',
                            value: 'https://protogen.army/' + interaction.options.getString('shortcode')
                        },
                    )
                    .setTimestamp()

                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [adminShortlinkAlert]})
            }).catch(async err => {
                //Does not exist
                const shortReportFailed = new EmbedBuilder()
                    .setColor("#eeff00")
                    .setTitle("Unknown Shortlink")
                    .setDescription("This shortlink does not seem to exist. Are you sure it is correct?")
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                interaction.reply({ embeds: [shortReportFailed]});
            })
        }).catch(async err => {
            const shortReportFailed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Error")
                .setDescription("An unspecified error has occurred upon sending a request to report. This has been forwarded to administrators to resolve.")
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            interaction.reply({ embeds: [shortReportFailed]});

            const adminShortlinkAlert = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("/reportshort Failed!")
                .setDescription("An attempted shortlink report has failed due to database errors. Please check the database connection and ensure all is well. Result:"+err)
                .setTimestamp()

            const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
            alarmChannel.send({embeds: [adminShortlinkAlert]})
        })
    },
};
