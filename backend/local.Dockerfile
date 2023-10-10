FROM node:17

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8080
EXPOSE 8081

CMD ["npm", "run", "serve"]

