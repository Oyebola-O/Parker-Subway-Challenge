FROM node:alpine

ENV NODE_VERSION 20.8.0

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js" ]