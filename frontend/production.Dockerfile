FROM node:14-alpine3.14

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 3001
EXPOSE 8080

CMD [ "npm", "run", "serve" ]
