// -------------------------------------------- express server 
// import express module and session module
const express = require('express');
const cookieSession = require('cookie-session');

// import http module
const http = require('http');

// import socket.io controller
const { setupSocketIO, ensureImageDirectoryExists } = require('./socket/mainSocketController');


// imports for retrieving public images
const fs = require('fs');
const path = require('path');

// // import http routes module, it is in the same directory as this file named routes.js
// const routes = require("./routes");

// const expressPort = 8080; // port 8080 is the default port for express

// this will be needed to ensure that we have a public directory in our project
// const ensureImageDirectoryExists = require("./socket/mainSocketController").ensureImageDirectoryExists;



// initiate express
const expressApp = express();

// use cookie session
expressApp.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    httpOnly: true,
    secure: false,
    domain: 'localhost',
}));

expressApp.get('/', function(req, res) {
    res.send('<h1>get response for the chat app</h1>');
});
  
// this is used to parse the request body on express server calls as json
expressApp.use(express.json());

// // import routes module
// expressApp.use("", routes);

// make sure we have a public image directory
ensureImageDirectoryExists();

// Serve static files from the public directory
expressApp.use(express.static(path.join(__dirname, 'public')));

// create an HTTP server and pass the express app
const httpServer = http.createServer(expressApp);

// ---------------------------------------------------------------
// socket.io server
// const { io } = require('./socket/mainSocketController')(httpServer); // passing the HTTP server instance to the Socket.IO setup

// Setup Socket.IO with the HTTP server
const io = setupSocketIO(httpServer);

const port = 8080; // unified port for both express and socket.io

// start the server on port 8080
httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


// // start the express server
// expressApp.listen(expressPort, () => {
//     console.log(`listening on port ${expressPort}`);
// });



// // ---------------------------------------------------------------
// // socket.io server
// const io = require('./socket/mainSocketController').io;
// const httpServer = require('./socket/mainSocketController').httpServer;

// const socketIOPort = 8081; // port 8081 is the default port for socket.io

// // start the socket.io server on port 8081
// io.listen(socketIOPort, () => {
//     console.log(`socket.io listening on port ${socketIOPort}`);
// });


// postgressql drivers ----------------------------------------------------

// initiate sequelize from connection on the database directory
const sequelize = require('./database/sequelize');


// const connection = sequelize.sqlConnection;
sequelize.syncDatabase();

// // sync the database
// connection.sync();


sequelize.testConnection();