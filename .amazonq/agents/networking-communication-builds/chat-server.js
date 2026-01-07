const net = require('net');

const clients = new Set();

const server = net.createServer((socket) => {
    clients.add(socket);
    console.log(`Client connected. Total: ${clients.size}`);
    
    socket.write('Welcome to chat server!\n');
    
    socket.on('data', (data) => {
        const message = data.toString().trim();
        console.log(`Message: ${message}`);
        
        // Broadcast to all clients except sender
        clients.forEach((client) => {
            if (client !== socket) {
                client.write(`${message}\n`);
            }
        });
    });
    
    socket.on('end', () => {
        clients.delete(socket);
        console.log(`Client disconnected. Total: ${clients.size}`);
    });
    
    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

const PORT = 9000;
server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
    console.log(`Connect with: telnet localhost ${PORT}`);
});
