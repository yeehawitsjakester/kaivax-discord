const {SlashCommandBuilder, EmbedBuilder, Client, GatewayIntentBits} = require('discord.js');
const { client } = require("/usr/src/app/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Shorten a long link.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to shorten')
                .setRequired(true)),

    async execute(interaction) {
        var crypto = require("crypto");
        const { pool } = require("/usr/src/app/addons/mariadb/config.js");
        let newURLCode = crypto.randomBytes(4).toString('hex');

        //Before we even connect to the database, let's validate that this is a valid URL otherwise Shlink will Shit the bed. *ba dum tiss*
        const isValidUrl = urlString=> {
            let url;
            try {
                url = new URL(interaction.options.getString('url'));
            } catch(err) {
                return false;
            }
            return url.protocol === "http:" || url.protocol === "https:";
        }

        if(isValidUrl(interaction.options.getString('url')) === true) {
            pool.getConnection().then(conn => {
                let cleanURLtoShorten = conn.escape(interaction.options.getString('url'))
                let sqlQuery = "INSERT INTO shlink.short_urls (domain_id, author_api_key_id, original_url, short_code, date_created, valid_since,valid_until, max_visits, import_source, import_original_short_code, title,title_was_auto_resolved, crawlable, forward_query) VALUES (null, null, "+cleanURLtoShorten+", '"+newURLCode+"', NOW(), null, null, null, null, null, null, DEFAULT,'0', '1');";
                let newQuoteTest = conn.query(sqlQuery).then(result =>{
                    const newURLShort = new EmbedBuilder()
                        .setColor("#00FF00")
                        .setTitle("New URL created!")
                        .setDescription("You can now view your new URL ("+interaction.options.getString('url')+") at https://protogen.army/"+newURLCode)
                        .setTimestamp()
                        .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                    interaction.reply({ embeds: [newURLShort]});
                    conn.close();
                }).catch(async err => {
                    const adminURLError = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setTitle("Error detected!")
                        .setDescription("We ran into an error attempting to create a new shortlink: " + err)
                        .addFields(
                            {name: 'Requested URL to Shorten', value: interaction.options.getString('url')},
                            {name: 'URL Shortcode Generated', value: newURLCode}
                        )
                        .setTimestamp()

                    const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                    alarmChannel.send({embeds: [adminURLError]})

                    interaction.reply("There was an error upon creation of the shortlink...please contact an administrator.")
                    conn.close()
                });
            }).catch(async err => {
                console.error("ERROR: Could not connect back to database to setup a short link. Do we have too many threads open?");
                const adminDBError = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Critical error!")
                    .setDescription("Database unavailable. Continued use of the bot may result in unintended consequences.")
                    .addFields(
                        { name: 'Maria Server',value: process.env.maria_host},
                    )
                    .setTimestamp()

                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [adminDBError]})
            });
        } else {
            const badURLShortReq = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("Bad URL!")
                .setDescription("Your requested URL ("+interaction.options.getString('url')+") is not valid. Please make sure you have the protocol (either http or https), a colon, 2 forward slashes, and then the domain name with the extras in your request. A valid shortlink should be something like https://dwxenterprises.net/somepage?somerequest=1")
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            interaction.reply({ embeds: [badURLShortReq]});
        }
    },
};
