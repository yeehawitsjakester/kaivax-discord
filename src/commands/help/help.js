// noinspection JSCheckFunctionSignatures

const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View the Kaivax help page.'),
    async execute(interaction) {
        const helppage = new EmbedBuilder()
            .setColor("#00FFFF")
            .setTitle("Kaivax - Help Page 1")
            .setAuthor({ name: 'Commands', url: 'https://dwxenterprises.net' })
            .setDescription('Kaivax is an open-source DiscordJS bot for the DWX Enterprises discord server. <> indicates a required field. [] indicates optional. See the following for valid commands:')
            .addFields(
                { name: '/ipqs ip <Public IP>', value: "Scan a public IP with IPQS to see if it's risky"},
                { name: '/ipqs phone <Phone>', value: "Scan a phone number with IPQS. Make sure to add the country code as well!"},
                { name: '/ipqs domain <Domain Address>', value: "Scan a domain with IPQS. Shows if it is parked, malware, adult, and more."},
                { name: '/ipqs email <Email Address>', value: "Scan an email with IPQS and see if its a burner or spam."},

                { name: '/shorten <URL>', value: "Shorten a URL and receive a new shortlink with https://protogen.army/YourNewShortenedURL"},
                { name: '/reportshort <Shortlink Code>', value: "Report a created Shortlink. The Shortlink code will be what comes after the forward slash, such as https://protogen.army/ReportedShortcodeIsHere"},

                { name: '/ping', value: "Pong!"},

                { name: '/quote [ID]', value: "Grab a random or specified quote from the Nexus."},
            )
            .setTimestamp()
            .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

        await interaction.reply({ embeds: [helppage]});
    },
};