const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const cmds = require('./registerCMD');
const retrieveShlinkVisits = require('/usr/src/app/addons/shlink/shlink.js');
const configuratorReload = require('/usr/src/app/addons/configurator/configurator.js')

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

const { pool } = require("/usr/src/app/addons/mariadb/config.js");
const checkYoutubeRSS = require("/usr/src/app/addons/rss/rss.js")

cmds.reloadSlashCommandz();

pool.getConnection().then(async conn => {
    console.log("Connected to MariaDB SQL server on index.js...")
    // Grab configuration from server
    await configuratorReload()
    //and set an interval to check in on shlink visits. 300000ms = 5min
    //TODO: Dont know if good idea, but want lots of customization. Either resolve "TypeError: Cannot read properties of undefined (reading 'shlink_checkRate')" or discard of grabbing from database for refresh rate.
    setInterval(retrieveShlinkVisits, '60000'); //1 min
    setInterval(() => checkYoutubeRSS(), '3600000'); //1 hour. This is because we're performing RSS queries. We don't want to get banned by Youtube (im not sure on their limits, but I think this *should* be fine?)
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



    //Token to sign into the Discord API.
    client.login(process.env.token);

}).catch(err => {
    console.error("FATAL: Unable to connect to MariaDB...")
    console.error(err)
});


