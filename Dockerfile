FROM node:current-alpine3.17

WORKDIR /usr/src/app

ADD src /usr/src/app

RUN npm install

#Run this to run the bot.
CMD ["node", "index.js" ]