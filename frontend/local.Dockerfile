FROM node:14-alpine3.14

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD [ "npm", "run", "serve-local" ]
