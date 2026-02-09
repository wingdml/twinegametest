// in server.js

// --- Handle ALL player connections and events here ---
io.on('connection', (socket) => {
    console.log('A player connected');

    // --- On-Connection Tasks ---
    socket.emit('loadDefaults', globalDefaults);
    socket.emit('loadMessages', messages);

    // --- Event Listeners ---

    // Listen for updates to shared variables
    socket.on('updateVariable', ({ key, value }, callback) => {
        console.log(`Update received from a client -> Key: ${key}, Value: ${value}`);
        globalDefaults[key] = value;
        io.emit('loadDefaults', globalDefaults);
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
    }); // <-- CORRECTED THIS BLOCK

}); // <-- CORRECTLY CLOSES io.on('connection',...)

// --- Start the Server (ONLY ONCE) ---
const PORT = process.env.PORT || 2433;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});