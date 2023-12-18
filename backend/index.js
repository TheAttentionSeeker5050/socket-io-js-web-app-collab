// -------------------------------------------- express server 
// import express module and session module
const express = require('express');
const cookieSession = require('cookie-session');

// import http module
const http = require('http');

// cors import
const cors = require('cors');

// import socket.io controller
const { setupSocketIO, ensureImageDirectoryExists } = require('./socket/mainSocketController');


// imports for retrieving public images
const fs = require('fs');
const path = require('path');

// // import http routes module, it is in the same directory as this file named routes.js
// const routes = require("./routes");

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

// this is used to parse the request body on express server calls as json
expressApp.use(express.json());

// cors configuration
const frontendUrl = process.env.FRONTEND_URL;

expressApp.use(cors({ 
    origin: [frontendUrl, 'http://localhost:3001', "*:3001"],
}));


expressApp.get('/', function(req, res) {
    res.send(
    "<div>" +
        "<h1>Server is now running</h1>" +
        `<a href="${frontendUrl}">Go to back frontend</a>` +
    "</div>"
    );
});

expressApp.get('/server-availability', (req, res) => {
    // Respond with a simple JSON object indicating the server is available
    res.json({ status: 'available' });
});
  

// // import routes module
// expressApp.use("", routes);

// make sure we have a public image directory
ensureImageDirectoryExists();

// Serve static files from the public directory
expressApp.use(express.static(path.join(__dirname, 'public')));

// create an HTTP server and pass the express app
const httpServer = http.createServer(expressApp);

// socket.io server ------------------------------------------------------
// socket.io server
// Setup Socket.IO with the HTTP server
const io = setupSocketIO(httpServer);

const port = 8080; // unified port for both express and socket.io

// listen to the server --------------------------------------------------
// start the server on port 8080
httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


// postgressql drivers ----------------------------------------------------

// initiate sequelize from connection on the database directory
const sequelize = require('./database/sequelize');


// const connection = sequelize.sqlConnection;
sequelize.syncDatabase();

// // sync the database
// connection.sync();


sequelize.testConnection();