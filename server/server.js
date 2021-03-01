"use strict";
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const process = require("process");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const playerSchema = require("./objModel");

const publicPath = path.join(__dirname, "/../public");
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicPath));

mongoose
  .connect(
    "mongodb+srv://server_catchMe:At0i22e45mdb@cluster0.mlab6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

server.listen(PORT, function () {
  console.log(`Serveur connecté sur le port ${PORT}`);
});

let players = {};

io.on("connection", (socket) => {
  console.log("socket.connected", socket.connected);

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

  socket.on("disconnect", function () {
    console.log(`Player ${socket.id} disconnected`);
    delete players[socket.id];
  });

  update();
  // setInterval(update, 1000 / 60);

  function update() {
    let playersList = Object.values(players);
    io.emit("playersOn", playersList);
    // console.log("players {}", players);
    // console.log("playersList", playersList);
    console.log("Server sent playersList !");
  }

  socket.on("playerClicked", (playersFromClient) => {
    io.emit("playersUpdate", playersFromClient);
    console.log("Server received playerClicked");
    console.log("Server sent playersUpdate");
  });

  socket.on("mouseMoved", (playersFromClient) => {
    io.emit("playersMoved", playersFromClient);
    console.log("Server received mouseMoved");
    console.log("Server sent playersMoved");
  });

  socket.on("startGame", () => {
    io.emit("startGame");
  });
});
