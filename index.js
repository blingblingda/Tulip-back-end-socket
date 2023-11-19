const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
// Set up Socket.IO with CORS configuration for a specific origin and allowed methods
const io = new Server(server, {
  cors: {
    origin: "https://tulip-fe.onrender.com",
    methods: ["GET", "POST"],
  },
});

// In-memory storage for chat messages, would typically be replaced with a database in a real application.
const messages = {};

// Handle socket connection events
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Handle "joinRoom" event when a user joins a chat room
  socket.on("joinRoom", ({ matchId, userName }) => {
    socket.join(matchId);

    if (!messages[matchId]) {
      messages[matchId] = [];
    }

    // Send chat history to the connecting user
    socket.emit("messageHistory", messages[matchId]);
    // Handle "sendMessage" event when a user sends a message
    socket.on("sendMessage", (content) => {
      console.log("send Message");
      const message = { user: userName, content };
      messages[matchId].push(message);
      // Broadcast the new message to all users in the room
      io.to(matchId).emit("newMessage", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  // Handle "disconnectUser" event to inform other users when someone disconnects
  socket.on("disconnectUser", (matchId) => {
    io.to(matchId).emit("userDisconnected", matchId);
  });
});

server.listen(3002, () => {
  console.log(`Server running on http://localhost:3002`);
});
