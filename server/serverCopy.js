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

server.listen(PORT, function () {
  console.log(`Serveur connecté sur le port ${PORT}`);
});

let players = {};
let ennemies = [];

io.on("connection", (socket) => {
  console.log("socket.connected", socket.connected);

  players[socket.id] = {
    id: socket.id,
    x: 580,
    y: 380,
    radius: 15,
    color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
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

  class Ennemy {
    constructor() {
      this.x = 20;
      this.y = 20;
      this.color = "red";
      this.radius = 5 + Math.ceil(Math.random() * 15);
      this.speedX = 1 + Math.floor(Math.random() * 4);
      this.speedY = -1 - Math.floor(Math.random() * 4);
    }
  }

  createEnnemies();

  function createEnnemies() {
    for (let i = 0; i < 5; i++) {
      ennemies[i] = new Ennemy();
    }
    io.emit("ennemiesCreated", ennemies);
    console.log("Server sent Ennemy");
  }

  function ennemiesPos() {
    ennemies.forEach((element) => {
      moveEnnemy(element);
    });
    io.emit("ennemiesUpdate", ennemies);
  }

  // setInterval(ennemiesPos, 1000 / 30);

  function moveEnnemy(ennemy) {
    if (
      ennemy.x + ennemy.speedX > 600 - ennemy.radius ||
      ennemy.x + ennemy.speedX < ennemy.radius
    ) {
      // ballsHitSound.play();
      ennemy.speedX = -ennemy.speedX;
    }
    if (
      ennemy.y + ennemy.speedY > 400 - ennemy.radius ||
      ennemy.y + ennemy.speedY < ennemy.radius
    ) {
      // ballsHitSound.play();
      ennemy.speedY = -ennemy.speedY;
    }
    ennemy.x += ennemy.speedX;
    ennemy.y += ennemy.speedY;
  }
});
