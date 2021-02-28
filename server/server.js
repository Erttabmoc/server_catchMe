"use strict";
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const process = require("process");

const publicPath = path.join(__dirname, "/../public");
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicPath));

server.listen(PORT, function () {
  console.log(`Serveur connecté sur le port ${PORT}`);
});

let players = {};

io.on("connection", (socket) => {
  console.log("Made socket connection", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 680,
    y: 280,
    radius: 15,
    color:
      "rgb(" +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      ")",
  };

  console.log("players", players);

  socket.on("disconnect", function () {
    console.log(`Player ${socket.id} disconnected`);
    delete players[socket.id];
  });

  updatePosition();
  // setInterval(updatePosition, 1000 / 60);

  function updatePosition() {
    io.emit("playersOn", Object.values(players));
  }

  socket.on("playerCliked", (playersFromClient) => {
    console.log("playerFromClient", playersFromClient);
    players = playersFromClient;
  });

  socket.on("mouseMoved", (playersFromClient) => {
    console.log("playerFromClient", playersFromClient);
    players = playersFromClient;
  });

  socket.on("startGame", () => {
    io.emit("startGame");
  });
});
