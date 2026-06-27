import 'dotenv/config';
import express from 'express'; // importing express module
import connectDB from './config/db.js';
import app from './app.js';

import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatMessage from './models/chatMessage.models.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected users map: Map<userId, socketId>
const onlineUsers = new Map();

// JWT Authentication Middleware for Socket.io
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decodedToken?._id;
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    const handleJoinUser = (userId) => {
        socket.userId = userId;
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        
        // Emit updated online users list to all online users individually
        for (const [uId, socketId] of onlineUsers.entries()) {
            io.to(socketId).emit("onlineUsers", Array.from(onlineUsers.keys()));
        }
        console.log(`User ${userId} joined room ${userId}`);
    };

    socket.on("joinUser", handleJoinUser);
    socket.on("join", handleJoinUser);

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    socket.on("sendMessage", async ({ conversationId, senderId, receiverId, text, image, file }) => {
        if (!text && !image && !file) return;
        try {
            // Save the message in MongoDB first
            const message = await ChatMessage.create({
                sender: senderId,
                receiver: receiverId,
                conversationId,
                message: text,
                image,
                file,
                read: false
            });

            // Emit the saved message to the room
            io.to(conversationId).emit("receiveMessage", message);

            // Emit notification to receiver's private room
            io.to(receiverId).emit("notification", {
                type: "message",
                sender: senderId,
                message: text || "Sent an attachment",
                conversationId
            });
        } catch (err) {
            console.error("Error in sendMessage handler:", err);
        }
    });

    socket.on("typing", ({ conversationId, senderId }) => {
        socket.to(conversationId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ conversationId, senderId }) => {
        socket.to(conversationId).emit("stopTyping", { senderId });
    });

    socket.on("messageSeen", async ({ conversationId, messageId, receiverId }) => {
        try {
            if (messageId) {
                await ChatMessage.findByIdAndUpdate(messageId, { read: true });
            } else {
                // Mark all unread messages in this conversation as read
                await ChatMessage.updateMany(
                    { conversationId, sender: receiverId, receiver: socket.userId, read: false },
                    { $set: { read: true } }
                );
            }
            // Notify room that messages have been seen
            io.to(conversationId).emit("messageSeen", { conversationId, messageId, receiverId });
        } catch (err) {
            console.error("Error in messageSeen handler:", err);
        }
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            // Emit updated online users list to all online users individually
            for (const [uId, socketId] of onlineUsers.entries()) {
                io.to(socketId).emit("onlineUsers", Array.from(onlineUsers.keys()));
            }
            console.log(`User ${socket.userId} disconnected`);
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


