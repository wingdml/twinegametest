const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// --- Basic Server Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Middleware ---
// This tells Express to serve your Twine HTML, CSS, and JS files
// from the 'public' folder.
app.use(express.static('public'));

// --- Global State ---
// These variables are stored in the server's memory.
// They will reset if the server restarts.
const messages = []; // Stores all chat messages.
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

// --- Main Connection Logic ---
// This entire block runs for every individual player who connects.
io.on('connection', (socket) => {
    console.log('A player connected. Socket ID:', socket.id);

    // --- Tasks to Run When a Player First Connects ---

    // 1. Send the current state of all world variables to the new player.
    socket.emit('loadDefaults', globalDefaults);

    // 2. Send the existing chat history to the new player.
    socket.emit('loadMessages', messages);


    // --- Event Listeners for This Specific Player ---

    // Listen for when a player updates a world variable (e.g., Protagonist).
    socket.on('updateVariable', ({ key, value }, callback) => {
        console.log(`Update received -> Key: ${key}, Value: ${value}`);

        // Update the state on the server.
        globalDefaults[key] = value;

        // Broadcast the *entire updated state* to EVERYONE connected.
        io.emit('loadDefaults', globalDefaults);

        // Send an "OK" acknowledgement back ONLY to the player who sent the update.
        // This is what triggers the Engine.play() refresh in your game.
        if (callback) {
            callback({ status: 'ok' });
        }
    });

    // Listen for when a player sends a chat message.
    socket.on('playerMessage', (msg) => {
        console.log('Message received:', msg);
        messages.push(msg);

        // Broadcast the new message to EVERYONE connected.
        io.emit('broadcastMessage', msg);
    });

    // Listen for when a player explicitly requests message history.
    socket.on('requestHistory', () => {
        socket.emit('loadMessages', messages);
    });

    // Listen for when this player disconnects.
    socket.on('disconnect', () => {
        console.log('A player disconnected. Socket ID:', socket.id);
    });

});

// --- Start the Server (This should only happen ONCE) ---
// Use the port Render provides via environment variables, or 2433 for local testing.
const PORT = process.env.PORT || 2433;
server.listen(PORT, () => {
    console.log(`Server is stable and running on port ${PORT}`);
});