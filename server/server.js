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

let players = [];
let ennemies = [];

io.on("connection", (socket) => {
  console.log("socket.connected", socket.connected);

  players[socket.id] = {
    id: socket.id,
    x: 580,
    y: 380,
    radius: 15,
    color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
    ready: "false",
  };

  socket.on("disconnect", function () {
    console.log(`Player ${socket.id} disconnected`);
    delete players[socket.id];
  });

  update();
  // setInterval(update, 1000 / 60);

  function update() {
    let checkPlayers = Object.values(players);
    io.emit("playersOn", checkPlayers);
    console.log("Server sent players", checkPlayers);
  }

  socket.on("startGame", (readyPlayers) => {
    players = readyPlayers;
    io.emit("startGame", players);
    console.log(`Player ${socket.id} is ready to play`);

    let anyPlayer = players.some((player) => player.ready == "false");
    console.log("anyPlayer", anyPlayer);
    if (anyPlayer == false) {
      // createEnnemies();
    }
  });

  let startEnnemiesMove = false;

  socket.on("playerClicked", (playersFromClient) => {
    io.emit("playersUpdate", playersFromClient);
    startEnnemiesMove = true;
    console.log("Server received playerClicked");
    console.log("Server sent playersUpdate");
    setInterval(moveEnnemies, 1000 / 60);
  });

  socket.on("mouseMoved", (playersFromClient) => {
    io.emit("playersMoved", playersFromClient);
    console.log("Server received mouseMoved");
    console.log("Server sent playersMoved");
  });

  let Ennemy = function () {
    this.x = 30;
    this.y = 30;
    this.color = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
    this.radius = 5 + Math.ceil(Math.random() * 15);
    this.speedX = 1 + Math.floor(Math.random() * 4);
    this.speedY = -1 - Math.floor(Math.random() * 4);
  };

  function createEnnemies() {
    for (let i = 0; i < 3; i++) {
      let ennemy = new Ennemy();
      ennemies.push(ennemy);
    }
    io.emit("ennemiesCreated", ennemies);
    console.log("Server sent Ennemy");
  }

  function moveEnnemies() {
    ennemies.forEach((ennemy) => {
      if (startEnnemiesMove == true) {
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
        io.emit("ennemiesUpdate", ennemies);
        console.log("Server sent ennemiesUpdate");
      }
    });
  }
});
