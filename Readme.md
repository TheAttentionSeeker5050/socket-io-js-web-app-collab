# Chat Application

## Live Demo
A live demo of this app can be found at https://socket-io-chat-app-frontend.onrender.com . You may first need to trigger the backend service: https://socket-io-chat-app-public-files-serve.onrender.com. Sorry for the inconvenience, we are working on a more intuitive and user-friendly solution, as this service's frontend and backend are being run as free render.com instances that are shut down when not being used.

## Backend

### Index.js on the root
This file executes on the server starts. This initiates the rest of the parts of the backend code, such as routes, sockets, and database. Focus on socket dir for the moment.

### Socket.io server
This server will listen to 'create-new-message' events, which are triggered by the client. Receives the message object, and saves it into the messages array (or database). It finally emits or triggers the event 'push-messages-to-client', which sends the messages to the client socket.io. Socket code is stored in the backend subdirectory called "socket" and there is only one file for the moment called mainSocketController.js. This is called from the index.js on the root of the backend directory.

### The message object
To get this project running, we are using an array instead of a database to store the messages, they are not compartmentalized into conversations and users either. Any user with access to the account can post its request. The object structure of the message item is the following:
- messageType: string, choices ['text', 'image', 'file'], defaults to 'text'
- content: string
- dateCreated: Date, defaults to current date (and time)
- dateUpdated: Date, defaults to current date (and time)
- conversationId: foreign key for the conversation, integer, for the moment this defaults to 1 and doesn't do anything 
- ownerId: foreign key for the owner of the message, integer, for the moment this defaults to 1 and doesn't do anything 
- author: this is the username of the owner, for the moment it defaults to the first 5 characters of the client socket ID

### The express server
Will make use of this later. 

### Environment variables
Please add a file called .env inside the backend folder with all the environment varables needed. Take the env_template as guidance.

## Frontend

### Socket.io client
The client will listen to 'push-messages-to-client' socket event. The function will receive the message array from the server and store the values in the frontend browser DOM. This event is triggered on connection starts (when a user enters or refreshes the page ) and when a new comment is posted. This array of messages is stored in the server as a dummy array for now. We will store these in the database in future versions. 

## Socket functionality
For making new socket.io event handlers, please refer to the documentation at https://socket.io/docs/v4/. This consists of two parts, client and server drivers. These may function differently and have slightly different methods from each other. 

For the moment focus on these two methods socket.on('trigger-event-name', callback function) and socket.emit('trigger-event-name', function params). 

The socket.on will listen to events with the name specified in 'trigger-event-name', and may or may not receive parameters in its callback function. 

The event will be triggered by using socket.emit function. A client that calls this method will trigger the event listener on the server, and vice versa. Takes the arguments 'trigger-event-name' and the arguments of the event listener callback function. Both socket.on and socket.emit work the same in the client and server. 
