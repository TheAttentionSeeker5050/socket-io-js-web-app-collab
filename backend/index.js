const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require('express');
const app = express();
const port = 8080;


app.get('/', (req, res) => {
    res.send('<h1>get response for the chat app</h1>');
    // res.send('<h1>get response for the chat app </h1><p>some other paragraph</p>');
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

// the following is the code for socket.io

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
