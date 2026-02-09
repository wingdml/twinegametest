const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve Twine game files from "public"
app.use(express.static('public'));

// --- Global State ---
const messages = []; // store all messages in memory
const globalDefaults = {
    Protagonist: "human",
    Geography: "yarn",
    Climate: "glowing",
    Species: "cat",
    Language: "running",
    Religion: "apple",
    Entertainment: "bubble",
    Military: "cake",
    Currency: "night",
    Transport: "chirping",
    Architecture: "mosaic",
    Time: "spiral",
    Hero: "Longwhisker",
    Villain: "Masked Weaver"
};

// --- Handle ALL player connections and events here ---
io.on('connection', (socket) => {
    console.log('A player connected');

    // --- On-Connection Tasks ---
    // Send current defaults to the new player
    socket.emit('loadDefaults', globalDefaults);
    // Send existing messages to the new client
    socket.emit('loadMessages', messages);

    // --- Event Listeners (all at the same level) ---

    // Listen for updates to shared variables
    socket.on('updateVariable', ({ key, value }, callback) => {
        console.log(`Update received from a client -> Key: ${key}, Value: ${value}`);
        globalDefaults[key] = value; // update server state
        
        // Broadcast the change to EVERYONE
        io.emit('loadDefaults', globalDefaults);
        
        // Send an acknowledgement back ONLY to the original sender
        if (callback) {
            callback({ status: 'ok' });
        }
    });

    // Listen for new chat messages
    socket.on('playerMessage', (msg) => {
        messages.push(msg);
        io.emit('broadcastMessage', msg);
    });

    // Listen for explicit history requests
    socket.on('requestHistory', () => {
        socket.emit('loadMessages', messages);
    });

    // Listen for disconnections
    socket.on('disconnect', () => {
        console.log('A player disconnected');
    });
});

// --- Start the Server (ONLY ONCE) ---
const PORT = process.env.PORT || 2433;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});