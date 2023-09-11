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
+ admin_channel - Channel ID of your "alerts" channel. Errors, alarms, and other admin-only stuff is posted here.
+ clientID - Your Client ID of your app in Discord Dev Portal
+ guildID - ID of your Discord server.
+ ipqs_token - Token from ipqualityscore.com. You'll need an account with them to get this. The Free tier allows 5000 API calls per month, but only 20 phone number calls per day, use wisely.
+ maria_host - Your MariaDB server.
+ maria_user - The user that the Discord bot should sign into the database server with.
+ maria_pwd - Password for said MariaDB user.
+ public_identifier - This is currently only used for mcsearch (user agent) as PlayerDB asks that you provide an identifier should they need to contact you. Will most likely be used for future user agent use.
+ token - Your Discord bot token. Make sure this matches the same app as your ClientID or you'll run into issues.

Should be as easy as that. Git clone, set VARs, spin it up in Docker, and make sure to set your roles and such in your server.
More features and details coming soon...