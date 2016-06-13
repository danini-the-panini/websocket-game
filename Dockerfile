FROM node:6.1.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY ./index.js /usr/src/app/index.js
COPY ./public /usr/src/app/public

ENV PORT 80
EXPOSE 80

CMD [ "npm", "start" ]
