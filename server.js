const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve Twine game files from "public"
app.use(express.static('public'));

// Handle player connections
const messages = []; // store all messages in memory
// Store global defaults for shared variables

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

  // ... add other variables here
};

io.on('connection', (socket) => {
  console.log('A player connected');

  // Send current defaults to new player
  socket.emit('loadDefaults', globalDefaults);
    // Send existing messages to the new client
  socket.emit('loadMessages', messages);

  // Listen for updates from players
  // in server.js

socket.on('updateVariable', ({ key, value }, callback) => { // <-- Add 'callback' here
  console.log(`Update received from a client -> Key: ${key}, Value: ${value}`);
  
  globalDefaults[key] = value; // update server state
  
  // This broadcasts the change to EVERYONE (including the sender)
  io.emit('loadDefaults', globalDefaults); 
  
  // This sends an acknowledgement back ONLY to the original sender
  if (callback) {
    callback({ status: 'ok' });
  }
});

  // Listen for new messages
  socket.on('playerMessage', (msg) => {
    messages.push(msg);
    io.emit('broadcastMessage', msg);
  });

  // Listen for explicit history requests (e.g. when a passage reloads)
  socket.on('requestHistory', () => {
    socket.emit('loadMessages', messages);
  });
});

// Use Render’s dynamic port (or fallback to 2433 locally)
const PORT = process.env.PORT || 2433;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});