// noinspection JSCheckFunctionSignatures

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const domain = require("domain");
const request = require("sync-request");

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcsearch')
        .setDescription('Search for player details on a Minecraft user or UUID')
        .addStringOption(option =>
            option.setName('target')
                .setDescription('Minecraft UUID or Username')
                .setRequired(true)),
    async execute(interaction) {
        const request = require('sync-request');

        interaction.deferReply();

        let mcUserDataResponse = await mcUserQuery(interaction.options.getString('target'))
        await wait(500);
        console.log(mcUserDataResponse)

        if(mcUserDataResponse.success === false) {
            const mcPlayerData = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: 'Minecraft User Search Failed', iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                .setDescription('Your search result for '+interaction.options.getString('target')+' returned with no data. Are you sure this UUID/Username is correct?')
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake and Powered by PlayerDB', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            await interaction.editReply({ embeds: [mcPlayerData]});
        }
        if(mcUserDataResponse.success === true) {
            const mcPlayerData = new EmbedBuilder()
                .setColor("#6c00c2")
                .setAuthor({ name: 'User: '+mcUserDataResponse.data.player.username, iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                .setDescription('User data and information for your user, '+mcUserDataResponse.data.player.username+' is as follows...')
                .addFields(
                    { name: 'Username', value: mcUserDataResponse.data.player.username.toString()},
                    { name: 'User ID', value: mcUserDataResponse.data.player.id.toString()},
                    { name: 'User ID (no dashes/raw)', value: mcUserDataResponse.data.player.raw_id.toString()},
                    { name: 'Avatar URL', value: mcUserDataResponse.data.player.avatar.toString()},
                )
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake and Powered by PlayerDB', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            await interaction.editReply({ embeds: [mcPlayerData]});
        }

        function mcUserQuery(target) {
            var url = "https://playerdb.co/api/player/minecraft/" + target;
            console.log("URL: "+url);
            try {

                var response = request('GET', url, {
                    headers: {
                        'user-agent': process.env.public_identifier,
                    },});
                console.log(response.getBody());
                return JSON.parse(response.getBody());
            }
            catch (error) {
                console.error(error);
                return false;
            }
        }
    },
};