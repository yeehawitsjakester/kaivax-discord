// noinspection JSCheckFunctionSignatures

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const domain = require("domain");

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ipqs')
        .setDescription('Run a lookup on Phone/Email/Web Domain/IP Addr')
        .addStringOption(option =>
            option.setName('querytype')
                .setDescription('Type IP/EMAIL/DOMAIN/PHONE')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('target')
                .setDescription('Target to scan')
                .setRequired(true)),
    async execute(interaction) {
        const request = require('sync-request');
        const key = process.env.ipqs_token;

        interaction.deferReply();
        await wait(1000);

        if(interaction.options.getString('querytype').toString().toLowerCase() === 'ip') {

                let ipqsIPResp = ipAddrQuery(interaction.options.getString('target'));

                let warnColor = '#B55EF1';
                if(ipqsIPResp.fraud_score < '25' || ipqsIPResp.fraud_score === '0') {
                    warnColor = '#00FF00';
                } if(ipqsIPResp.fraud_score < '50' && ipqsIPResp.fraud_score > '25') {
                    warnColor = '#ead625'; //PISS
                } if(ipqsIPResp.fraud_score < '75' && ipqsIPResp.fraud_score > '50') {
                    warnColor = '#EA7125';
                } if(ipqsIPResp.fraud_score > '75') {
                    warnColor = '#FF0000';
                }

            const ipqs_ipresult = new EmbedBuilder()
                        .setColor(warnColor)
                        .setTitle("Hostname: "+ipqsIPResp.host)
                        .setAuthor({ name: 'IP Check', iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                        .setDescription('Request to scan '+interaction.options.getString('target')+' has a fraud score of '+ipqsIPResp.fraud_score+' and resulted in the following results...')
                        .addFields(
                            { name: 'Country', value: ipqsIPResp.country_code.toString(), inline: true },
                            { name: 'Region/State', value: ipqsIPResp.region.toString(), inline: true },
                            { name: 'City', value: ipqsIPResp.city.toString(), inline: true },
                            { name: 'Internet Provider', value: ipqsIPResp.ISP.toString()},
                            { name: 'Crawlerbot?', value: ipqsIPResp.is_crawler.toString(), inline: true},
                            { name: 'Timezone', value: ipqsIPResp.timezone.toString(), inline: true},
                            { name: 'Proxy Server?', value: ipqsIPResp.proxy.toString()},
                            { name: 'VPN Provider?', value: ipqsIPResp.vpn.toString(), inline: true},
                            { name: 'TOR Node?', value: ipqsIPResp.tor.toString(), inline: true},
                            { name: 'Automated bot?', value: ipqsIPResp.bot_status.toString()},
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Built by YeehawItsJake and Powered by IPQualityScore', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

                await interaction.editReply({ embeds: [ipqs_ipresult]});
        }

        if(interaction.options.getString('querytype').toString().toLowerCase() === 'phone') {
            let ipqsPhoneResp = phoneQuery(interaction.options.getString('target'));

            let warnColor = '#B55EF1';
            if(ipqsPhoneResp.fraud_score < '25' || ipqsPhoneResp.fraud_score === '0') {
                warnColor = '#00FF00';
            } if(ipqsPhoneResp.fraud_score < '50' && ipqsPhoneResp.fraud_score > '25') {
                warnColor = '#ead625'; //PISS
            } if(ipqsPhoneResp.fraud_score < '75' && ipqsPhoneResp.fraud_score > '50') {
                warnColor = '#EA7125';
            } if(ipqsPhoneResp.fraud_score > '75') {
                warnColor = '#FF0000';
            }

            if (ipqsPhoneResp.prepaid == null) {
                prepaidStatus = 'Unknown';
            } else {
                prepaidStatus = ipqsPhoneResp.prepaid.toString();
            }
            const ipqs_phoneresult = new EmbedBuilder()
                .setColor(warnColor)
                .setTitle("Phone Number: "+ipqsPhoneResp.local_format)
                .setAuthor({ name: 'Phone Check', iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                .setDescription('Request to scan '+interaction.options.getString('target')+' has a fraud score of '+ipqsPhoneResp.fraud_score+' and resulted in the following results...')
                .addFields(
                    { name: 'Country', value: ipqsPhoneResp.country.toString()},
                    { name: 'Region/State', value: ipqsPhoneResp.region.toString(), inline: true },
                    { name: 'City', value: ipqsPhoneResp.city.toString(), inline: true },
                    { name: 'ZIP', value: ipqsPhoneResp.zip_code.toString(), inline: true},

                    { name: 'Carrier', value: ipqsPhoneResp.carrier.toString()},
                    { name: 'Phone Type', value: ipqsPhoneResp.line_type.toString(), inline: true},
                    { name: 'Email2SMS Address', value: ipqsPhoneResp.sms_email.toString(), inline: true},

                    { name: 'Prepaid?', value: prepaidStatus},
                    { name: 'Internet Phone?', value: ipqsPhoneResp.VOIP.toString(), inline: true},
                    { name: 'High Risk?', value: ipqsPhoneResp.risky.toString(), inline: true},
                    { name: 'Recent Problems?', value: ipqsPhoneResp.recent_abuse.toString()},

                    { name: 'In Data Leak?', value: ipqsPhoneResp.leaked.toString()},
                    { name: 'Known Spammer?', value: ipqsPhoneResp.spammer.toString(), inline: true},
                    { name: 'On Telemarketing Do Not Call List?', value: ipqsPhoneResp.do_not_call.toString(), inline: true},

                )
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake and Powered by IPQualityScore', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            await interaction.editReply({ embeds: [ipqs_phoneresult]});

            await interaction.editReply(phoneQuery(interaction.options.getString('target')));
        }

        if(interaction.options.getString('querytype').toString().toLowerCase() === 'domain') {
            let ipqsDomainResp = await domainQuery(interaction.options.getString('target'));

            let warnColor = '#B55EF1';
            if(ipqsDomainResp.risk_score < '25' || ipqsDomainResp.risk_score === '0') {
                warnColor = '#00FF00';
            } if(ipqsDomainResp.risk_score < '50' && ipqsDomainResp.risk_score > '25') {
                warnColor = '#ead625'; //PISS
            } if(ipqsDomainResp.risk_score < '75' && ipqsDomainResp.risk_score > '50') {
                warnColor = '#EA7125';
            } if(ipqsDomainResp.risk_score > '75') {
                warnColor = '#FF0000';
            }

            const ipqs_domainresult = new EmbedBuilder()
                .setColor(warnColor)
                .setTitle("Domain: "+ipqsDomainResp.domain.toString())
                .setAuthor({ name: 'Domain Scan', iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                .setDescription('Request to scan '+interaction.options.getString('target')+' has a risk score of '+ipqsDomainResp.risk_score+' and resulted in the following results...')
                .addFields(
                    { name: 'IP Address', value: ipqsDomainResp.ip_address.toString()},
                    { name: 'HTTP Content Type', value: ipqsDomainResp.content_type.toString(), inline: true },
                    { name: 'Response', value: ipqsDomainResp.status_code.toString(), inline: true},
                    { name: 'DNS Valid?', value: ipqsDomainResp.dns_valid.toString(), inline: true},
                    { name: 'Parked?', value: ipqsDomainResp.parking.toString(), inline: true},

                    { name: 'Unsafe?', value: ipqsDomainResp.unsafe.toString()},
                    { name: 'Spam-like behavior?', value: ipqsDomainResp.spamming.toString(), inline: true},
                    { name: 'Malware detected?', value: ipqsDomainResp.malware.toString(), inline: true},
                    { name: 'Phishing page?', value: ipqsDomainResp.phishing.toString(), inline: true},
                    { name: 'Sussy Baka?', value: ipqsDomainResp.suspicious.toString(), inline: true},

                    { name: 'Adult Content?', value: ipqsDomainResp.adult.toString()},
                )
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake and Powered by IPQualityScore', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            await interaction.editReply({ embeds: [ipqs_domainresult]});
        }

        if(interaction.options.getString('querytype').toString().toLowerCase() === 'email') {
            let ipqsEmailResp = await emailQuery(interaction.options.getString('target'));

            let warnColor = '#B55EF1';
            if(ipqsEmailResp.fraud_score < '25' || ipqsEmailResp.fraud_score === '0') {
                warnColor = '#00FF00';
            } if(ipqsEmailResp.fraud_score < '50' && ipqsEmailResp.fraud_score > '25') {
                warnColor = '#ead625'; //PISS
            } if(ipqsEmailResp.fraud_score < '75' && ipqsEmailResp.fraud_score > '50') {
                warnColor = '#EA7125';
            } if(ipqsEmailResp.fraud_score > '75') {
                warnColor = '#FF0000';
            }

            //SMTP Score
            let smtpAlert = 'Unknown';
            if(ipqsEmailResp.smtp_score === '-1') {
                smtpAlert = 'Invalid';
            } if(ipqsEmailResp.smtp_score === '0') {
                smtpAlert = 'SMTP Server rejection';
            } if(ipqsEmailResp.smtp_score === '1') {
                smtpAlert = 'Temp. Rejection Err';
            } if(ipqsEmailResp.smtp_score === '2') {
                smtpAlert = 'Catch-All Server';
            } if(ipqsEmailResp.smtp_score === '3') {
                smtpAlert = 'Verified & Active';
            }

            //Overall Score
            let overallAlert = 'Unknown';
            if(ipqsEmailResp.overall_score === '0') {
                overallAlert = 'Invalid';
            } if(ipqsEmailResp.overall_score === '1') {
                overallAlert = 'Good DNS/Bad Server';
            } if(ipqsEmailResp.overall_score === '2') {
                overallAlert = 'Temp. Rejection Err';
            } if(ipqsEmailResp.overall_score === '3') {
                overallAlert = 'Catch-All Server';
            } if(ipqsEmailResp.overall_score === '4') {
                overallAlert = 'Verified & Active';
            }
            const ipqs_emailresult = new EmbedBuilder()
                .setColor(warnColor)
                .setTitle("Email: "+ipqsEmailResp.sanitized_email.toString())
                .setAuthor({ name: 'Email Check', iconURL: 'https://cdn.dwxenterprises.net/images/main/gear.png', url: 'https://dwxenterprises.net' })
                .setDescription('Request to scan '+interaction.options.getString('target')+' has a risk score of '+ipqsEmailResp.fraud_score+' and resulted in the following results...')
                .addFields(
                    { name: 'Valid Email?', value: ipqsEmailResp.valid.toString()},
                    { name: 'Generic Email Provider?', value: ipqsEmailResp.generic.toString(), inline: true },
                    { name: 'Common Email Provider?', value: ipqsEmailResp.common.toString(), inline: true},
                    { name: 'Valid DNS Settings?', value: ipqsEmailResp.dns_valid.toString()},
                    { name: 'Honeypot Email?', value: ipqsEmailResp.honeypot.toString(), inline: true},
                    { name: 'Deliverability', value: ipqsEmailResp.deliverability.toString(), inline: true},
                    { name: 'Frequent Complaints from address?', value: ipqsEmailResp.frequent_complainer.toString()},
                    { name: 'Catch All Address?', value: ipqsEmailResp.catch_all.toString(), inline: true},
                    { name: 'Time out error?', value: ipqsEmailResp.timed_out.toString(), inline: true},
                    { name: 'Recent Problems?', value: ipqsEmailResp.recent_abuse.toString()},
                    { name: 'SMTP Score', value: smtpAlert, inline: true},
                    { name: 'Overall Score', value: overallAlert, inline: true},
                )
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake and Powered by IPQualityScore', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });

            await interaction.editReply({ embeds: [ipqs_emailresult]});
        }

        if(interaction.options.getString('querytype').toString().toLowerCase() != 'email' && interaction.options.getString('querytype').toString().toLowerCase() != 'phone' && interaction.options.getString('querytype').toString().toLowerCase() != 'domain' && interaction.options.getString('querytype').toString().toLowerCase() != 'ip') {
            await interaction.editReply("You've provided an incorrect query type. The valid options are: PHONE, IP, EMAIL, or DOMAIN. Please try again.");
        }

        function ipAddrQuery(queryIP) {
            var url = "https://www.ipqualityscore.com/api/json/ip/" + key + "/" + queryIP;
            console.log("URL: "+url);
            try {
                var response = request('GET', url);
                //console.log(response.getBody());
                return JSON.parse(response.getBody());
            }
            catch (error) {
                console.error(error);
                return "-1";
            }
        }

        function phoneQuery(queryPhone) {
            var url = "https://www.ipqualityscore.com/api/json/phone/" + key + "/" + queryPhone;
            try {
                var response = request('GET', url);
                console.log(response.getBody());
                return JSON.parse(response.getBody());
            }
            catch (error) {
                console.error(error);
                return "-1";
            }
        }

        function emailQuery(queryEmail) {
            var url = "https://www.ipqualityscore.com/api/json/email/" + key + "/" + queryEmail;
            try {
                var response = request('GET', url);
                console.log(response.getBody());
                return JSON.parse(response.getBody());
            }
            catch (error) {
                console.error(error);
                return "-1";
            }
        }

        function domainQuery(queryDomain) {
            var url = "https://www.ipqualityscore.com/api/json/url/" + key + "/" + queryDomain;
            try {
                var response = request('GET', url);
                console.log(response.getBody());
                return JSON.parse(response.getBody());
            }
            catch (error) {
                console.error(error);
                return "-1";
            }
        }
    },
};