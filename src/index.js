import 'dotenv/config';
import express from 'express'; // importing express module
import connectDB from './config/db.js';
import app from './app.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected users map
const userSockets = new Map();

io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        userSockets.set(userId, socket.id);
        io.emit("userOnlineStatus", { userId, status: "online" });
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on("sendMessage", (messageData) => {
        // Broadcast real-time message to recipient room
        socket.to(messageData.receiver).emit("messageReceived", messageData);
        // Echo back notification
        socket.to(messageData.receiver).emit("notification", {
            type: "message",
            sender: messageData.sender,
            message: messageData.message
        });
    });

    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
        socket.to(receiverId).emit("typingStatus", { senderId, isTyping });
    });

    socket.on("disconnect", () => {
        // Find user by socket ID
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                io.emit("userOnlineStatus", { userId, status: "offline" });
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Share io instance with express app routes
app.set("io", io);

connectDB()
.then(() => {
    httpServer.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000} (with Socket.io active)`);
    });
})
.catch((err) => {
    console.log("Error starting the server", err);
});








































// import dotenv from 'dotenv'; // importing dotenv module
// dotenv.config({ path: './.env' }); // configuring dotenv to load environment variables from .env file

// const app = express(); // calling express and storing in app variable

// app.get('/api', (req, res) => { // defining a route for the root URL
//     res.send('<h1>API response</h1>'); // sending a response to the client
// })

// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port ${process.env.PORT}`);
// })


