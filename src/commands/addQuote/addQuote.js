const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addquote')
        .setDescription('Add a new quote to the Nexus Archives')
        .addStringOption(option =>
            option.setName('msg')
                .setDescription('Message to add')),

    async execute(interaction) {
        if (member.roles.cache.some(role => role.name === 'role name')) {
            //TODO: Role requirement to use addQuote command.
        }
        const mariadb = require('mariadb');
        const pool = mariadb.createPool({
            host: process.env.maria_host,
            user: process.env.maria_user,
            password: process.env.maria_pwd,
            connectionLimit: 5
        });

        pool.getConnection().then(conn => {
            let newQuoteString = conn.escape(interaction.options.getString('msg'))
            let newQuoteTest = conn.query("INSERT INTO mainwebsite.quotes (quote) VALUES ('"+newQuoteString+"');").then(result =>{
                interaction.reply("New quote successfully added to the archives.")
                conn.close();
            }).catch(err => {
                interaction.reply("Whoops! We had an error adding this quote to the database. See console logs for more information...")
                console.error(err)
                conn.close()
            });
        }).catch(err => {
            console.error("ERROR: Could not connect back to database to retrieve quotes. Do we have too many threads open?");
            interaction.editReply("Looks like we had an error attempting that. Try again later?");
        });
    },
};
