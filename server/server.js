"use strict";
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const process = require("process");
const bodyParser = require("body-parser");

const publicPath = path.join(__dirname, "/../public");
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: true }));

let username;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/game.html"));
  username = req.body.username;
  console.log("username", username);
});

app.use(express.static(publicPath));

server.listen(PORT, function () {
  console.log(`Serveur connecté sur le port ${PORT}`);
});

let players = [];
let ennemies = [];

// Connexion des sockets
io.on("connection", (socket) => {
  console.log("socket.connected", socket.connected);

  // Enregistrement du joueur
  players[socket.id] = {
    id: socket.id,
    x: 500,
    y: 250 + 100 * Math.random(),
    radius: 15,
    color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
    ready: "false",
    user: username,
  };

  // Détecter la déconnexion des joueurs
  socket.on("disconnect", function () {
    console.log(`Player ${socket.id} disconnected`);
    let disconnectPlayer = players.some((player) => player.id == socket.id);
    if (disconnectPlayer == socket.id) {
      delete players[socket.id];
      io.emit("playersUpdate", players);
    }
  });

  update();

  // Enregistrement des joeurs dans un tableau
  function update() {
    let checkPlayers = Object.values(players);
    io.emit("playersOn", checkPlayers);
    console.log("Server sent players", checkPlayers);
    console.log("players", players);
  }

  // Créer les ennemies dans un tableau
  function createEnnemies() {
    for (let i = 0; i < 5; i++) {
      let ennemy = new Ennemy();
      ennemies.push(ennemy);
    }
    io.emit("ennemiesCreated", ennemies);
  }

  // Réception des mises des données des joeurs
  socket.on("playerReady", (readyPlayers) => {
    players = readyPlayers;
    io.emit("playerReady", players);
    console.log(`Player ${socket.id} is ready to play`);
    let anyPlayer = players.some((player) => player.ready == "false");
    console.log("anyPlayer", anyPlayer);
    if (anyPlayer == false) {
      createEnnemies();
    }
  });

  let startEnnemiesMove = false;

  // Réception du signal de lancement de la partie
  socket.on("startChrono", (gooo) => {
    socket.emit("startChrono");
    startEnnemiesMove = true;
    setInterval(moveEnnemies, 1000 / 60);
  });

  // Mise à jour des données des joeurs
  socket.on("playerClicked", (playersFromClient) => {
    io.emit("playersUpdate", playersFromClient);
  });

  // Mise à jour des données des joeurs
  socket.on("mouseMoved", (playersFromClient) => {
    io.emit("playersMoved", playersFromClient);
  });

  // Créer les ennemies
  let Ennemy = function () {
    this.x = 30;
    this.y = 30;
    this.color = "red";
    this.radius = 5 + Math.ceil(Math.random() * 15);
    this.speedX = 1 + Math.floor(Math.random() * 4);
    this.speedY = -1 - Math.floor(Math.random() * 4);
  };

  // Mouvoir les ennemies
  function moveEnnemies() {
    ennemies.forEach((ennemy) => {
      if (startEnnemiesMove == true) {
        if (
          ennemy.x + ennemy.speedX > 600 - ennemy.radius ||
          ennemy.x + ennemy.speedX < ennemy.radius
        ) {
          ennemy.speedX = -ennemy.speedX;
        }
        if (
          ennemy.y + ennemy.speedY > 400 - ennemy.radius ||
          ennemy.y + ennemy.speedY < ennemy.radius
        ) {
          ennemy.speedY = -ennemy.speedY;
        }
        ennemy.x += ennemy.speedX;
        ennemy.y += ennemy.speedY;
        io.emit("ennemiesUpdate", ennemies);
      }
    });
  }
});
