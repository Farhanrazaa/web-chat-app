const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors'); 

const app = express();
const server = http.createServer(app);

// --- 1. CORS Configuration ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://web-chat-app-one.vercel.app" // Your correct Vercel URL
];

// Setup CORS for Express API routes
app.use(cors({
  origin: allowedOrigins
}));

// Setup CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// --- 2. API Routes ---
// This is the route that is currently 404 Not Found
app.get('/api/users', (req, res) => {
    const users = [
        { id: '1', name: 'Jennifer Lisity', status: 'Active Now', avatar: 'https.i.pravatar.cc/150?img=1', lastMessage: "Said one, let. Morning them, said. So were..." },
        { id: '2', name: 'Nancy J. Martinez', status: 'Online', avatar: 'https.i.pravatar.cc/150?img=2', lastMessage: "Hey Jennifer, I just saw your message right now..." },
        { id: '3', name: 'Helen Pool', status: '1h ago', avatar: 'https.i.pravatar.cc/150?img=3', lastMessage: "abundantly be fruitful morning moveth hath..." },
        { id: '4', name: 'Marcel Rubio', status: 'Active Now', avatar: 'https.i.pravatar.cc/150?img=4', lastMessage: "Brings living great. Lesser, brought the..." },
        { id: '5', name: 'Frances J. Royter', status: 'Online', avatar: 'https.i.pravatar.cc/150?img=5', lastMessage: "his after the cattle an he form... " },
        { id: '6', name: 'David Lee', status: 'Offline', avatar: 'https.i.pravatar.cc/150?img=6', lastMessage: "See you at the meeting." },
        { id: '7', name: 'Maria Garcia', status: 'Active Now', avatar: 'https.i.pravatar.cc/150?img=7', lastMessage: "Got the files, thanks!" },
        { id: '8', name: 'Chris Evans', status: '2h ago', avatar: 'https.i.pravatar.cc/150?img=8', lastMessage: "On my way." },
        { id: '9', name: 'Sophie Turner', status: 'Online', avatar: 'https.i.pravatar.cc/150?img=9', lastMessage: "That sounds great!" },
        { id: '10', name: 'Ken Watanabe', status: 'Offline', avatar: 'https.i.pravatar.cc/150?img=11', lastMessage: "Please review the document." },
        { id: '11', name: 'Aisha Khan', status: 'Active Now', avatar: 'https.i.pravatar.cc/150?img=12', lastMessage: "I'll call you back." }
    ];
    res.json(users);
});


// --- 3. WebSocket Logic ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', (data) => {
        socket.broadcast.to(data.roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// --- 4. Serve React App (Static Files) ---
app.use(express.static(path.join(__dirname, '../client/build')));


// --- 5. Fallback for React Router ---
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});