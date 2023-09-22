# Kaivax The Discord DWXE Bot
Kaivax is a bot I've developed purely for the DWX Enterprises official discord (invite link in my Github page, under Linktree)
Just to show it off a bit and allow others to learn from my code (and mistakes...), I've provided this here now.

## How do I launch Kaivax?
Kaivax is designed to be used in Docker. At the moment, it only uses Docker ENVs. I do plan on adding secrets support here soon.
You'll want a MariaDB server as well, although this isnt fully required. The Database server is only required for the following commands (so far):
+ /shorten (Uses an existing Shlink database)
+ /reportshort (only used to validate a Shortlink code)
+ /quote (Retrieves some random quotes from our database, mostly just stuff from memories and shitposts)
+ /addQuote (Adds additional quotes to the database)

This bot is currently in use for Docker Swarm. Really any containerd orchestrator should work (I think?)

To finish setup, make sure you also have the following VARs set:
+ admin_channel - (Moved to DB) Channel ID of your "alerts" channel. Errors, alarms, and other admin-only stuff is posted here.
+ clientID - (Moved to DB) Your Client ID of your app in Discord Dev Portal
+ guildID - (Moved to DB) ID of your Discord server.
+ ipqs_token - Token from ipqualityscore.com. You'll need an account with them to get this. The Free tier allows 5000 API calls per month, but only 20 phone number calls per day, use wisely.
+ maria_host - Your MariaDB server.
+ maria_user - The user that the Discord bot should sign into the database server with.
+ maria_pwd - Password for said MariaDB user.
+ public_identifier - (Moved to DB) This is currently only used for mcsearch (user agent) as PlayerDB asks that you provide an identifier should they need to contact you. Will most likely be used for future user agent use.
+ token - Your Discord bot token. Make sure this matches the same app as your ClientID or you'll run into issues.

Should be as easy as that. Git clone, set VARs, spin it up in Docker, and make sure to set your roles and such in your server.
More features and details coming soon...

### Jake's TODO list...
theres a good chance i'll forget some dumb feature or something that seemed really good at the time, im sleep deprived at 3 in the morning writing this, be patient with me here...
+ [Done: moved some configs over to database. Not fond of moving the token over so I think we will keep that as is for now] Move some configs to MariaDB. Better scaling, add/remove setting options as needed, less bs all around. Leave ENV to define Dev/Prod?
+ [Done: Shlink results are polled every 15 seconds] Database events. Hold last ID read off from shlink visits to keep track and run a scan every interval on the db. If shlink_visit_id = 10 AND database table says theres now 11, annouce data from 11th result, then save last id as 11. Repeat as results come in.
+ Discord events. Need to annouce and run some fancy schmancy stuff for server management like account joins.
+ Blacklisting. Pertains more to each owner (and our own server...), basically to each their own, but i dont doubt we will have some retard trying to break the bot or attempt unwanted actions. do fix said problems but also dont be an asshat.
+ Minecraft RCON to NodeJS module. Be able to sync chat as well as allow some members to send commands. Maybe even a payment GW/shop to allow people to pay 5$ to fuck with others on the server.
+ RSS feeds. This is a much needed thing given appaRENTLY WE'RE NOW SELLING THE MOST BASIC OF BOTS? idk, maybe its harder then it looks, but I shall have RSS damnit!
+ annoucements to new members of the server. small feature but would like to have a customized message, perhaps based on the invite.
+ add enable/disable certain commands and events
+ 