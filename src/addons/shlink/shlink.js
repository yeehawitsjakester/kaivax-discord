const {EmbedBuilder} = require("discord.js");
module.exports = function retrieveShlinkVisits() {
    const configuratorReload = require('/usr/src/app/addons/configurator/configurator.js')
    const { pool } = require("/usr/src/app/addons/mariadb/config.js");
    const { client } = require("/usr/src/app/index.js");

    pool.getConnection().then(async conn => {
        const {EmbedBuilder} = require("discord.js");
        console.log('Retrieving new Shlink visits, one moment...')
        let getShlinkVisitsReq = conn.query('SELECT * FROM shlink.visits LIMIT 1 OFFSET ' + global.configurator.shlink_lastVisitID + ';').then(async result => {
            //console.log('SELECT * FROM shlink.visits LIMIT 1 OFFSET ' + global.configurator.shlink_lastVisitID + ';')
            let newVisitID = result[0].id;
            let previousVisitID = global.configurator.shlink_lastVisitID;

            if (newVisitID != null && newVisitID != previousVisitID) {
                //There is a valid click ahead of this one.
                console.log('Found new results for Shlink visits. Processing...')
                conn.query("UPDATE kaivax.discord_settings SET settingValue = '" + result[0].id + "' WHERE settingName = 'shlink_lastvisit_id';")

                configuratorReload()

                let possibleBot;
                if (result[0].potential_bot === '1') {
                    possibleBot = 'True';
                } else {
                    possibleBot = 'False';
                }

                const shlinkVisitNotification = new EmbedBuilder()
                    .setColor("#0051ff")
                    .setTitle("Click! New shortlink visit")
                    .addFields(
                        {name: 'Referer', value: result[0].referer || 'Unknown (returned empty!)'},
                        {name: 'Visitor IP Address', value: result[0].remote_addr || 'Unknown (returned empty!)'},
                        {name: 'User Agent', value: result[0].user_agent || 'Unknown (returned empty!)'},
                        {name: 'Target URL', value: result[0].visited_url || 'Unknown (returned empty!)'},
                        {name: 'Result', value: result[0].type || 'Unknown (returned empty!)'},
                        {name: 'Possible bot?', value: possibleBot},
                    )
                    .setTimestamp()
                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [shlinkVisitNotification]})
            } else {
                //No more clicks :(
                console.log('[INFO] No new Shlink shortlink visits on check. Current: ' + global.configurator.shlink_lastVisitID + ' Found:' + result[0].id)
            }
            conn.close()
        }).catch(err => {
            console.error("[INFO] Unable to retrieve new results. Assuming that we have up to date information")

            console.error(err)
            //TODO: Null is treated as an error when it should be a sign that we are up to date.
        });
    });
}