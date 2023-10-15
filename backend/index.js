
// ---------------------------------------------------------------
// express server
const express = require('express');
const expressApp = express();
const expressPort = 8080;


expressApp.get('/', (req, res) => {
    res.send('<h1>get response for the chat app</h1>');
});


expressApp.listen(expressPort, () => {
    console.log(`listening on port ${expressPort}`);
});

// ---------------------------------------------------------------
// socket.io server


const { createServer } = require("http");
const { Server } = require("socket.io");

const socketIOPort = 8081;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
});

httpServer.listen(socketIOPort, () => {
    console.log(`socket.io listening on port ${socketIOPort}`);
});


// postgressql drivers ----------------------------------------------------

// use the sequelize ORM to connect to the database
const { Sequelize } = require('sequelize');

// pass the .env variables to the connection string
const CONN_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const sequelize = new Sequelize(CONN_STRING) // Example for postgres


// test the connection function
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection with the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
} 

testConnection();