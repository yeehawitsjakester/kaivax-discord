const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const cmds = require('./registerCMD');
const client = new Client({intents: [GatewayIntentBits.Guilds]});
exports.client = client

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.maria_host,
    user: process.env.maria_user,
    password: process.env.maria_pwd,
    connectionLimit: 5
});

cmds.reloadSlashCommandz();

pool.getConnection().then(conn => {
    console.log("Connected to MariaDB SQL server on index.js...")
    // Create a new client instance

    //Command cooldown
    client.cooldowns = new Collection();

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

    //Token to sign into the Discord API. Configured from ./config.json
    client.login(process.env.token);

}).catch(err => {
    console.error("FATAL: Unable to connect to MariaDB...")
    console.error(err)
});


