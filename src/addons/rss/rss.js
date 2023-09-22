/*
    Because YouTube offers RSS, we will use a similar tactic in processing our Shlink clicks here to process new YouTube videos.
    Basically, it boils down to the following:
        + RSS feed added to follow
        + RSS feed refreshed & latest item id cached (item.id)
        + item.id stored in database
        + RSS feed refreshed every hour
        + If item.id of latest item is different then what is stored in database, announce new video

    We can probably use this same method for other feeds, one thing at a time though...lets get this bread and get this configured first.

    Added note: TODO: need to differentiate between YouTube links and standard RSS feeds, this can be done through the domain.

    Note 2: Each RSS item has an isoDate and pubDate. Can also be used if really needed to identify latest item. May be better for videos that are deleted and the latest id changes.
*/

const {EmbedBuilder} = require("discord.js");
var request = require('sync-request');
const { channelId } = require('@yeehawitsjakester/node-get-youtube-id-by-url')
const { pool } = require("/usr/src/app/addons/mariadb/config.js");
const { client } = require("/usr/src/app/index.js");
let Parser = require('rss-parser');
let parser = new Parser();

    function addYouTubeRSS(youtubeChannelURL) {
    let addYTRSSstatus = false;
    var res = request('GET',youtubeChannelURL);
    if(res.statusCode === 200) {
        (async () => {

            youtubeChannelID = await channelId(youtubeChannelURL)
            let feed = await parser.parseURL("https://youtube.com/feeds/videos.xml?channel_id="+youtubeChannelID);

            pool.getConnection().then(async conn => {
                let cleanRssID = conn.escape(youtubeChannelID)
                let cleanLastID = conn.escape(feed.items[0].id)
                let addNewYTRSSFeedQuery = 'INSERT INTO kaivax.discord_rss (rssIdentifier, lastID) VALUES ('+cleanRssID+','+cleanLastID+');'
                let addNewYTRSSFeedReq = conn.query(addNewYTRSSFeedQuery).then(async result => {
                    addYTRSSstatus = true;
                }).catch(async err => {
                    /*
                    addYTRSSstatus = false;
                    const failedYouTubeRSSINSERT = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Error detected on adding YTRSS!')
                        .setDescription('A command was ran to add a channel at '+youtubeChannelURL+' but failed. It looks like this is related to an INSERT database command, ensure that the bot has permissions to insert into the table.')
                        .addFields(
                            { name: 'SQL Query', value: addNewYTRSSFeedQuery}
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
                    const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                    alarmChannel.send({embeds: [failedYouTubeRSSINSERT]})

                    I am just gonna call it here, I have no clue how the hell to fix this because its both "true" and works, but doesnt?
                     */
                });
            }).catch(async err => {
                addYTRSSstatus = false;
                const failedYouTubeRSSmariaCONN = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Error detected on adding YTRSS!')
                    .setDescription('A command was ran to add a channel at '+youtubeChannelURL+' but failed. It looks like this is due to a connection issue on the database. Please ensure that your database node is online and accepting connections.')
                    .setTimestamp()
                    .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
                const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
                alarmChannel.send({embeds: [failedYouTubeRSSmariaCONN]})
            });

        })();
        //this is where it finishes?
        addYTRSSstatus = true;
        return addYTRSSstatus;
    } else {
        console.log('rss.js>> Status did NOT return 200!')
        return addYTRSSstatus;
    }
}
    function checkYoutubeRSS() {
    pool.getConnection().then(async conn => {
        let getRSSFeedsYoutubeOnly = 'SELECT * FROM kaivax.discord_rss WHERE lastID LIKE "yt:video%";';
        let addNewYTRSSFeedReq = conn.query(getRSSFeedsYoutubeOnly).then(async result => {
            result.forEach(youtubeChannel => {
                (async () => {

                    let feed = await parser.parseURL("https://youtube.com/feeds/videos.xml?channel_id="+youtubeChannel.rssIdentifier);
                    if(youtubeChannel.lastID !== feed.items[0].id) {
                        const announceChannel = await client.channels.fetch(global.configurator.annoucementsChannel)
                        announceChannel.send({content: "New video from "+feed.items[0].author+" located at "+feed.items[0].link })

                        let updateYoutubeLastVideoID = 'UPDATE kaivax.discord_rss SET lastID = "'+feed.items[0].id+'" WHERE rssIdentifier = "'+youtubeChannel.rssIdentifier+'";';
                        await conn.query(updateYoutubeLastVideoID)
                    } else {
                        //no new RSS updates
                        console.log('No new feed updates for channel ID: '+youtubeChannel.rssIdentifier)
                    }
                })();
            })
        }).catch(async err => {
            console.log("Hmm, we had an issue connecting to the database. Trying again later...")
        });
    });
}
    function addStandardRSS(RSSfeedURL) {

    let addRSSstatus = false;
    var res = request('GET',RSSfeedURL);

    (async () => {
        let feed = await parser.parseURL(RSSfeedURL);

        pool.getConnection().then(async conn => {
            let cleanRssID = conn.escape(RSSfeedURL)
            let cleanLastID = conn.escape(feed.items[0].id)
            //console.log(feed)
            let addNewRSSFeedQuery = 'INSERT INTO kaivax.discord_rss (rssIdentifier, lastID) VALUES ('+cleanRssID+','+cleanLastID+');'
            let addNewYTRSSFeedReq = conn.query(addNewRSSFeedQuery).then(async result => {
                addRSSstatus = true;
            }).catch(async err => {
                addRSSstatus = false;
            });
        }).catch(async err => {
            addRSSstatus = false;
            const failedRSSmariaCONN = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error detected on adding Standard RSS!')
                .setDescription('A command was ran to add a new feed at '+RSSfeedURL+' but failed. It looks like this is due to a connection issue on the database. Please ensure that your database node is online and accepting connections.')
                .setTimestamp()
                .setFooter({ text: 'Built by YeehawItsJake', iconURL: 'https://cdn.dwxenterprises.net/images/main/dwxeicon.jpg' });
            const alarmChannel = await client.channels.fetch(global.configurator.admin_channel)
            alarmChannel.send({embeds: [failedRSSmariaCONN]})
        });
        return addRSSstatus;
    })();
    addRSSstatus = true;
    return addRSSstatus;

    console.log("RAHHHH FUCJKING RING THUNS FUNCUTOIN FOR DFUCKS SAKEc")

}
    function checkStandardRSS() {
    pool.getConnection().then(async conn => {
        let getRSSFeedsYoutubeOnly = 'SELECT * FROM kaivax.discord_rss WHERE lastID NOT LIKE "yt:video%";';
        let addNewYTRSSFeedReq = conn.query(getRSSFeedsYoutubeOnly).then(async result => {
            result.forEach(rssFeed => {
                (async () => {

                    let feed = await parser.parseURL(rssFeed);
                    if(rssFeed.lastID !== feed.items[0].id) {
                        const announceChannel = await client.channels.fetch(global.configurator.annoucementsChannel)
                        announceChannel.send({content: "New video from "+feed.items[0].author+" located at "+feed.items[0].link })

                        let updateYoutubeLastVideoID = 'UPDATE kaivax.discord_rss SET lastID = "'+feed.items[0].id+'" WHERE rssIdentifier = "'+youtubeChannel.rssIdentifier+'";';
                        await conn.query(updateYoutubeLastVideoID)
                    } else {
                        //no new RSS updates
                        console.log('No new feed updates for channel ID: '+youtubeChannel.rssIdentifier)
                    }
                })();
            })
        }).catch(async err => {
            console.log("Hmm, we had an issue connecting to the database. Trying again later...")
        });
    });
}

module.exports = {
    addYouTubeRSS: addYouTubeRSS,
    addStandardRSS: addStandardRSS,
    checkStandardRSS: checkStandardRSS,
    checkYoutubeRSS: checkYoutubeRSS
}

//addStandardRSS('http://www.reddit.com/r/news/.rss')