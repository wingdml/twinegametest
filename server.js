const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve Twine game files from "public"
app.use(express.static('public'));

// Handle player connections
io.on('connection', (socket) => {
  console.log('A player connected');

  socket.on('playerMessage', (msg) => {
    // Broadcast to all players
    io.emit('broadcastMessage', msg);
  });
});

// Use Render’s dynamic port (or fallback to 2433 locally)
const PORT = process.env.PORT || 2433;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});