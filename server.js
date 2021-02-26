"use strict";
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

const PORT = 8080;
const server = app.listen(PORT, function () {
  console.log(`Connexion sur le port ${PORT}`);
});

const socketio = require("socket.io");
const io = socketio(server);

// Players list
const playersData = {};

io.on("connection", (socket) => {
  // socket.on("mouseMove", (data) => {
  //   console.log("*****************");
  //   console.log("data", data);
  //   console.log("*****************");
  // });
  // console.log("Socket connected");

  // Register new player
  playersData[socket.id] = {
    x: 560,
    y: 360,
    color:
      "rgb(" +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      ")",
    radius: 15,
  };

  // Delete disconnected player
  socket.on("disconnect", function () {
    delete playersData[socket.id];
  });

  function updatePosition() {
    io.volatile.emit("playersOn", Object.values(playersData));
  }

  setInterval(updatePosition, 1000 / 60);

  io.on("connection", function (socket) {
    socket.on("mouseMoved", function () {
      playersData[socket.id].x =
        e.pageX - canvas.offsetLeft - playersData[socket.id].radius / 2;
      playersData[socket.id].y =
        e.pageY - canvas.offsetTop - playersData[socket.id].radius / 2;
    });
  });
});
