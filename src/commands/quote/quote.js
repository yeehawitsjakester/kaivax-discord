const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get a quote from the Nexus Archives')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Quote ID (optional)')),
    async execute(interaction) {

        const { pool } = require("/usr/src/app/addons/mariadb/config.js");

        pool.getConnection().then(conn => {
            if(interaction.options.getString('id') != null) {
                let newQuoteTest = conn.query('SELECT quote,id FROM mainwebsite.quotes WHERE id="'+interaction.options.getString('id')+'";').then(result =>{
                    console.log("Quote Req>> ["+result[0].id+"]"+result[0].quote);
                    interaction.reply("["+result[0].id+"]"+result[0].quote)
                    conn.close();
                }).catch(err => {
                    interaction.reply("Shit, that wasn't right. Try that command again later.")
                });
            } else {
                let newQuoteTest = conn.query("SELECT quote,id FROM mainwebsite.quotes ORDER BY RAND() LIMIT 1;").then(result =>{
                    console.log("Quote Req>> ["+result[0].id+"]"+result[0].quote);
                    interaction.reply("["+result[0].id+"]"+result[0].quote)
                    conn.close();
                }).catch(err => {
                    interaction.reply("Shit, that wasn't right. Try that command again later.")
                });
            }
        }).catch(err => {
            console.error("ERROR: Could not connect back to database to retrieve quotes. Do we have too many threads open?");
            interaction.editReply("Looks like we had an error attempting that. Try again later?");
        });
    },
};
