// using es6 modules
import $ from "jquery";
import { io } from "socket.io-client";

// import dotenv from 'dotenv';
// dotenv.config();

// if (process.env.BACKEND_URL === undefined) {
//     console.log("BACKEND_URL is undefined");
//     process.env.BACKEND_URL = "https://socket-io-chat-app-public-files-serve.onrender.com";
// } 
// const socketConnectionUrl = process.env.BACKEND_URL;
const socketConnectionUrl =  "socket-io-chat-app-public-files-serve.onrender.com";
// create a socket.io instance and establish a connection to the server 
const socket = io(socketConnectionUrl);

async function checkServerAvailability() {
    try {
        const response = await fetch('https://socket-io-chat-app-public-files-serve.onrender.com/server-availability');
        if (response.ok) {
            // Server is available, remove the loading message
            document.getElementById('backend-loading-msg').style.display = 'none';
            // Stop checking server availability
            clearInterval(intervalId); 
        } else {
            // Server is not yet available, show the loading message
            document.getElementById('backend-loading-msg').textContent = 'Waiting for the server to start...';
        }

    } catch (error) {
        // Handle any errors here (e.g., network error)
        console.error('Error checking server availability:', error);
    }
}

// Check server availability periodically (e.g., every few seconds)
const intervalId = setInterval(checkServerAvailability, 3000);


// reference DOM items
const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageInput');
const messages = document.getElementById('messages');
// add author

let currentUserSocketId;

socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
});

socket.on("connect", () => {
    currentUserSocketId = socket.id;
});


// listen for form submission
form.addEventListener('submit', async (e) => {
    // prevent app page refresh on submission
    e.preventDefault();

    // Check for text message
    const textMessage = input.value;

    // Check for image file
    const imageFile = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;

    // Handle text message
    if (imageFile) {

        let sendUploadImageResponse = new Object();


        await socket.emit("image-upload", imageInput.files[0], async (status) => {
            
    
            const myMessageObj = {
                messageType: 'image',
                imagePath: status?.imageName, // the image string from the response
                imageAlt: input.value,
                content: input.value || "Default alt",
                dateCreated: Date.now(),
                dateUpdated: Date.now(),
                author: localStorage.getItem("author"),
    
            };
            
            await socket.emit('create-new-message', myMessageObj);
            input.value = ''; // Clear the text input
    
            
    
            imageInput.value = ''; // Clear the image input
        })
        

        
    } else if (textMessage) {
        const myMessageObj = {
            messageType: 'text',
            content: input.value,
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            author: localStorage.getItem("author"),
        };
        await socket.emit('create-new-message', myMessageObj);
        input.value = ''; // Clear the text input
    }

});

// this listens for new messages from the server event "pull-messages-from-server"
// the server triggers this event, for example on app refresh, or
// when a new message is created

socket.on('push-messages-to-client', (messagesArray) => {

    // remove all the messages from the DOM first
    messages.innerHTML = '';

    if (messagesArray) {

        
        // loop through the messages array and display each message
        for (let message of messagesArray) {
            // create a new list item to display the message
            const item = document.createElement('p');
            item.classList.add("flex-col")
            const content = document.createElement('p');
            
            content.className='message-content';
            
            const breakLine = document.createElement('br');
            const author = document.createElement('strong');
            const timestamp = document.createElement('span');
            // *** add line below
            timestamp.className = 'message-timestamp';
            
            
            // check if the message is today's message for timestamp formatting
            const messageDate = new Date(message.dateCreated);
            const today = new Date();
            const isToday = messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear();
            
            
            
            
            // Formatting the date and time
            const timeFormatOptions = { hour: 'numeric', minute: 'numeric' };
            const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            if (isToday) {
            timestamp.textContent = messageDate.toLocaleTimeString([], timeFormatOptions);
        } else {
            timestamp.textContent = messageDate.toLocaleDateString([], dateFormatOptions) + ', ' +
            messageDate.toLocaleTimeString([], timeFormatOptions);
        }
        
        
        // if it's a text message, create a text message item
        if (message.messageType === 'text') {
            // add message authorship span text
            author.textContent = new String(message.author) + " wrote: ";
            item.appendChild(author);
            item.appendChild(breakLine);
            item.appendChild(content);
            
            // display the author as the first 5 characters of the socket id
            content.textContent = message.content;
        } else if (message.messageType === 'image') {
            // add message authorship span text
            author.textContent = new String(message.author) + " sent: ";
            item.appendChild(author);
            
            
            
            const image = document.createElement('img');
            image.classList.add("msg-img")
            // the image's base64 string
            image.src = message.imagePath;
            image.alt = message.imageAlt;

            // in case the image is not found
            image.onerror = function () {
                // Replace the image with a default image URL in case of an error
                // create a default w3schools blank image
                image.src = "https://socket-io-chat-app-public-files-serve.onrender.com/imgs/img-not-found.jpg";
            };

            item.appendChild(image);
        }
        
        // assign the correct color to the message
        if (message.author.startsWith(localStorage.getItem('author'))) {
            // self messages
            item.style.backgroundColor = 'lightsteelblue';
        } else {
            // others' messages
            item.style.backgroundColor = 'peachpuff';
        }
        
        
        // add timestamp
        item.appendChild(timestamp);
        
        // add the message item to the list of messages
        messages.appendChild(item);
        }
        
        // message appears at the bottom of the screen
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// use jquery to change the author name, and localstorage
$(document).ready(function() {
    // Check if a value is already stored in localStorage
    let  storedAuthor = localStorage.getItem('author');
    if (storedAuthor) {
        // Set the input value to the stored value
        $('#author-input').val(storedAuthor);
    } else {
        storedAuthor = "author";
        // Set the default value if nothing is stored
        $('#author-input').val(storedAuthor);
        // Save to localstorage
        localStorage.setItem('author', storedAuthor);

    }

    // Event listener for the button click
    $('#author-change-btn').click(function() {
        // Get the value from the input field
        var author = $('#author-input').val();

        // Store the value in localStorage
        localStorage.setItem('author', author);

        $('#author-save-feedback').text('Author name saved');
        // Clear the feedback message after a few seconds
        setTimeout(function() {
            $('#author-save-feedback').text('');
        }, 3000); // Clears the feedback after 3 seconds
    });
});
