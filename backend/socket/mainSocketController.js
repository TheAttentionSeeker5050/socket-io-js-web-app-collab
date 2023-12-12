// this will be the main socket.io controller
const { createServer } = require("http");
const { Server } = require("socket.io");

// for saving files:
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import the uuid module

// Directory where images will be stored
const imagesDir = path.join(__dirname, "..", 'public', 'images');

// import the message repository
const MessageRepository = require('../repositories/message.repository');


// Ensure the images directory exists
function ensureImageDirectoryExists() {

    if (!fs.existsSync(imagesDir)){
        fs.mkdirSync(imagesDir, { recursive: true });
    }
}


// // in general, this is an HTTP server that will be used by socket.io, among other things
// const httpServer = createServer();

function setupSocketIO(httpServer) {
    // this will be used to add new socket.io events
    const io = new Server(httpServer, {
        cors: {
            origin: `${process.env.FRONTEND_URL}`,
            methods: ["GET", "POST"]
        },
        rejectUnauthorized: false,
        
    });



    // this is the main socket.io event listener, it scans for new connections
    // when a new connection is made, it will log a message to the console
    io.on('connection', async (socket) => {

        try {

            
            let messageArray = await MessageRepository.getAllMessages();
            
            // when a new connection is made, it will send the messageArray to the client
            await socket.emit('push-messages-to-client', messageArray)
            
        } catch (e) {
            await socket.emit('push-messages-to-client', [])

        }

        // when a user disconnects, it will log a message to the console
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        // this will allow us to handle file upoads
        socket.on("image-upload", (file, callback) => {

            try {
                
                // add an image name as unique id using UUID library
                let newImageName = `${uuidv4()}.png`;  

                if (file.type == "image/jpeg") {
                    let newImageName = `${uuidv4()}.jpg`;  
                }
                
                // Ensure the imageName is defined
                if (!newImageName) {
                    callback({ message: "failure", imageName: "", error: "could not create new image" });
                    return;
                }

                // Construct the full file path including the imageName
                const filePath = path.join(imagesDir, newImageName);

                // // ensure directory exists
                ensureImageDirectoryExists()

                // Save the content to the disk
                fs.writeFile(filePath, file, (err) => {
                    if (err) {
                        // Return an error message if there's an issue in writing the file
                        callback({ message: "failure", imageName: "", error: err.message });
                    } else {
                        // Return success message and the imageName
                        callback({ message: "success", imageName: newImageName, error: "" });
                    }
                });
            } catch (e) {
                console.log("error on image upload: ", e)
            }
        })

        // listening for incoming chat messages from the server
        socket.on('create-new-message', async (messageObj) => {
            // use interface to type the messageObj
            let newMessage = new Object();

            // check if the user entered a text message correctly, only text, image, and file are allowed, else default to text
            if (messageObj.messageType === 'text' || messageObj.messageType === 'image' || messageObj.messageType === 'file') {
                newMessage.messageType = messageObj.messageType;
            } else {
                newMessage.messageType = 'text';
            }

            if (messageObj.messageType === 'image') {
                
                newMessage.imageAlt = messageObj.content;
                newMessage.imagePath = `${process.env.BACKEND_URL}/images/${messageObj.imagePath}`
            }

            // add the rest of the newMessage
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

            try {
            
                // use the database to store the messages
                // and the repository pattern to access the database CRUD operations
                await MessageRepository.createMessage(newMessage);
            
                
                // get the updated message array from the database
                let updatedMessageArray = await MessageRepository.getAllMessages();
                
                // return the message array to the client using server emit
                await io.emit('push-messages-to-client', updatedMessageArray);
                
            } catch (e) {
                console.log("error at pulling messages after created new message", e);
            }
        });
    });

    return io;
}




module.exports = {
    // io,
    // httpServer,
    setupSocketIO,
    ensureImageDirectoryExists,
}
