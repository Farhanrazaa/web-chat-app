const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// --- 1. API Routes ---
// We define API routes FIRST, so they are always matched before the static files.
// Inside server/index.js

app.get('/api/users', (req, res) => {
    const users = [
        { id: '1', name: 'Jennifer Lisity', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: "Said one, let. Morning them, said. So were..." },
        { id: '2', name: 'Nancy J. Martinez', status: 'Online', avatar: 'https://i.pravatar.cc/150?img=2', lastMessage: "Hey Jennifer, I just saw your message right now..." },
        { id: '3', name: 'Helen Pool', status: '1h ago', avatar: 'https://i.pravatar.cc/150?img=3', lastMessage: "abundantly be fruitful morning moveth hath..." },
        { id: '4', name: 'Marcel Rubio', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=4', lastMessage: "Brings living great. Lesser, brought the..." },
        { id: '5', name: 'Frances J. Royter', status: 'Online', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: "his after the cattle an he form... " },
        { id: '6', name: 'David Lee', status: 'Offline', avatar: 'https://i.pravatar.cc/150?img=6', lastMessage: "See you at the meeting." },
        { id: '7', name: 'Maria Garcia', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=7', lastMessage: "Got the files, thanks!" },
        { id: '8', name: 'Chris Evans', status: '2h ago', avatar: 'https://i.pravatar.cc/150?img=8', lastMessage: "On my way." },
        { id: '9', name: 'Sophie Turner', status: 'Online', avatar: 'https://i.pravatar.cc/150?img=9', lastMessage: "That sounds great!" },
        { id: '10', name: 'Ken Watanabe', status: 'Offline', avatar: 'https://i.pravatar.cc/150?img=11', lastMessage: "Please review the document." },
        { id: '11', name: 'Aisha Khan', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: "I'll call you back." }
    ];
    res.json(users);
});


// --- 2. WebSocket Logic ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', (data) => {
        io.to(data.roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// --- 3. Serve the React App (Static Files) ---
// This serves files like index.html, main.js, main.css
app.use(express.static(path.join(__dirname, '../client/build')));


// --- 4. Fallback for React Router ---
// THIS IS THE FIXED LINE.
// It uses a regex to match any path that DOES NOT start with /api
// This forwards all other requests (like /chat/123) to React.
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});