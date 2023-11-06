const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update this to match your frontend URL in production
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
      const message = { user: userName, content };
      messages[matchId].push(message);
      io.to(matchId).emit("newMessage", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3002, () => {
  console.log(`Server running on http://localhost:3002`);
});
