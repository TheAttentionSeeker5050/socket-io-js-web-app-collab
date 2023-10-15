
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

// for the express server
const exppgdriver = require('pg-promise')();
// this is the connection to the database through the express server
const expdb = exppgdriver('postgres://postgres:mysecretpassword@chat-app-database:5432/postgres');

