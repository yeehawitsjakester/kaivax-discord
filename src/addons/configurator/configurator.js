module.exports = function configuratorReload() {
    const { pool } = require("/usr/src/app/addons/mariadb/config.js");

    pool.getConnection().then(async conn => {
        let getShlinkVisitsQuery = conn.query('SELECT * FROM kaivax.discord_settings').then(result => {
            console.log('CONF: Reloading configuration...');
            //Call vars
            global.configurator = {
                admin_channel: result[0].settingValue,
                guildID: result[1].settingValue,
                bot_username: result[2].settingValue,
                shlink_lastVisitID: result[3].settingValue,
                shlink_checkRate: result[4].settingValue,
                cacheIPQS: result[5].settingValue,
                ipqsCacheTime: result[6].settingValue,
                public_identifier: result[7].settingValue,
                enableGreeting: result[8].settingValue,
                greetingString: result[9].settingValue,
                greetingChannel: result[10].settingValue,
                enableConfessions: result[11].settingValue,
                confessionsChannel: result[12].settingValue,
                blacklistedProfileItems: result[13].settingValue.split(","),
                annoucementsChannel: result[14].settingValue
            }
            console.log('CONF: Configuration reloaded and up to date.');
            conn.close();
        }).catch(err => {
            console.error("[FATAL] Cannot retrieve configuration from database server. Exiting! Received: " + err)
            process.exit(-1)
        });
    });
}