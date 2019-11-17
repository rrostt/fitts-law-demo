FROM node:10

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY webpack.config.js /app
COPY src /app/src
COPY lib /app/lib

CMD npm start
