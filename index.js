const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://tulip-fe.onrender.com", // Update this to match your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Stores messages in memory. In a real application, this should be in a database.
const messages = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinRoom", ({ matchId, userName }) => {
    socket.join(matchId);
    if (!messages[matchId]) {
      messages[matchId] = [];
    }

    // Send history
    socket.emit("messageHistory", messages[matchId]);
    socket.on("sendMessage", (content) => {
      console.log("send Message");
      const message = { user: userName, content };
      messages[matchId].push(message);
      io.to(matchId).emit("newMessage", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  // Handle "disconnectUser" event
  socket.on("disconnectUser", (userId) => {
    // Broadcast the disconnect event to all other users in the same room or conversation
    socket.broadcast.emit("userDisconnected", userId);
  });
});

server.listen(3002, () => {
  console.log(`Server running on http://localhost:3002`);
});
