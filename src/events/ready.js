const { Events, Routes} = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`[${client.user.tag}] Initialized and ready for work.`);
    },
};