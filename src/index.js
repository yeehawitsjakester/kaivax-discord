const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const cmds = require('./registerCMD');

const client = new Client({intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]});

exports.client = client
let configurator;
exports.configurator = configurator;

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.maria_host,
    user: process.env.maria_user,
    password: process.env.maria_pwd,
    connectionLimit: 5
});

cmds.reloadSlashCommandz();

pool.getConnection().then(async conn => {
    console.log("Connected to MariaDB SQL server on index.js...")
    // Grab configuration from server
    await configuratorReload()
    //and set an interval to check in on shlink visits. 300000ms = 5min
    //TODO: Dont know if good idea, but want lots of customization. Either resolve "TypeError: Cannot read properties of undefined (reading 'shlink_checkRate')" or discard of grabbing from database for refresh rate.
    //setInterval(retrieveShlinkVisits, '15000');
    //Read command files
    client.commands = new Collection();
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

    }

    //Read event files
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    function configuratorReload() {
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
                blacklistedProfileItems: result[13].settingValue.split(",")
            }
            console.log('CONF: Configuration reloaded and up to date.');
            conn.close();
        }).catch(err => {
            console.error("[FATAL] Cannot retrieve configuration from database server. Exiting! Received: " + err)
            process.exit(-1)
        });
    }

    function retrieveShlinkVisits() {
        console.log('Retrieving new Shlink visits, one moment...')
        let getShlinkVisitsReq = conn.query('SELECT * FROM shlink.visits LIMIT 1 OFFSET ' + global.configurator.shlink_lastVisitID + ';').then(async result => {
            console.log('SELECT * FROM shlink.visits LIMIT 1 OFFSET ' + global.configurator.shlink_lastVisitID + ';')
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
            //TODO: Null is treated as an error when it should be a sign that we are up to date.
        });
    }

    //Token to sign into the Discord API.
    client.login(process.env.token);

}).catch(err => {
    console.error("FATAL: Unable to connect to MariaDB...")
    console.error(err)
});


