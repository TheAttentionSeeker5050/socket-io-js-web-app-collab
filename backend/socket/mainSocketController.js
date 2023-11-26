// this will be the main socket.io controller
const { createServer } = require("http");
const { Server } = require("socket.io");

// import the message repository
const MessageRepository = require('../repositories/message.repository');


// // make a dummy conversationObj array to store conversations, this will be provisional while we make the database sync
// let messageArray = [
//     {
//         conversationType: 'text',
//         content: 'hello',
//         dateCreated: Date.now(),
//         dateUpdated: Date.now(),
//         conversationId: 1,
//         author: 'asdasd',
//         ownerId: 1
//     },
//     {
//         conversationType: 'text',
//         content: 'world',
//         dateCreated: Date.now(),
//         dateUpdated: Date.now(),
//         conversationId: 1,
//         author: 'dssdsd',
//         ownerId: 1
//     }
// ];

// in general, this is an HTTP server that will be used by socket.io, among other things
const httpServer = createServer();


// this will be used to add new socket.io events
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
    rejectUnauthorized: false,
    
});

// this is the main socket.io event listener, it scans for new connections
// when a new connection is made, it will log a message to the console
io.on('connection', async (socket) => {
    console.log('a user connected');

    
    let messageArray = await MessageRepository.getAllMessages();

    // when a new connection is made, it will send the messageArray to the client
    await socket.emit('push-messages-to-client', messageArray)


    // when a user disconnects, it will log a message to the console
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // listening for incoming chat messages from the server
    socket.on('create-new-message', async (messageObj) => {
        // use interface to type the messageObj
        let newMessage = new Object();

        // check if the user entered a text message correctly, only text, image, and file are 
        // allowed, otherwise default to text
        if (messageObj.messageType === 'text' || messageObj.messageType === 'image' || messageObj.messageType === 'file') {
            newMessage.messageType = messageObj.messageType;
        } else {
            newMessage.messageType = 'text';
        }

        // add the rest of the conversation
        newMessage.content = messageObj.content;
        newMessage.dateCreated = Date.now();
        newMessage.dateUpdated = Date.now();

        // add the author field for this, we will first check if the 
        // messageObj.author is not empty, if it is empty, we will use the socket.id as the author
        if (messageObj.author) {
            newMessage.author = messageObj.author;
        } else {
            newMessage.author = socket.id + "";
        }

        // use the database to store the messages
        // and the repository pattern to access the database CRUD operations
        await MessageRepository.createMessage(newMessage);

        // get the updated message array from the database
        let updatedMessageArray = await MessageRepository.getAllMessages();

        // return the message array to the client using server emit
        await io.emit('push-messages-to-client', updatedMessageArray);

    });
});

module.exports = {
    io,
    httpServer,
}
