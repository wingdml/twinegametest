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

io.on('connection', (socket) => {
  console.log('A player connected');

  // Send existing messages to the new client
  socket.emit('loadMessages', messages);

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