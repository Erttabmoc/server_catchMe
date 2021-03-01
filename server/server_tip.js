"use strict";
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const process = require("process");
const { create } = require("domain");

const publicPath = path.join(__dirname, "/../public");
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
let ennemies = []

app.use(express.static(publicPath));

server.listen(PORT, function () {
  console.log(`Serveur connecté sur le port ${PORT}`);
});

let players = {};

function createEnnemies(difficulty) {
  let ennemies = [];
  let d = difficulty !== undefined ? difficulty : 5
  // for (let i = 0; i < d; i++) {
  //   let ennemy = {
  //     position: {
  //       x: 20,
  //       y: 20,
  //     },
  //     color: "red",
  //     radius: 5 + Math.ceil(Math.random() * 15),
  //     speed: {
  //       x: 1 + Math.floor(Math.random() * 4),
  //       y: -1 - Math.floor(Math.random() * 4),
  //     }
  //   };
  //   ennemies.push(ennemy);
  // }
  let ennemy = {
    position: {
      x: 20,
      y: 20,
    },
    color: "red",
    radius: 5 + Math.ceil(Math.random() * 15),
    speed: {
      x: 1 + Math.floor(Math.random() * 4),
      y: -1 - Math.floor(Math.random() * 4),
    }
  };
  return ennemy;
}

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

  updatePosition();
  // setInterval(updatePosition, 1000 / 60);

  function updatePosition() {
    let playersList = Object.values(players);
    console.log("playersList", playersList);
    io.emit("playersOn", playersList);
    // console.log("players {}", players);
  }

  socket.on("playerCliked", (playersFromClient) => {
    console.log("playerFromClient", playersFromClient);
    io.emit("playersUpdate", playersFromClient);
  });
  socket.on("playerMoved", (data) => {
    socket.emit("moveAdversaire", data);
  });
  socket.on("mouseMoved", (playersFromClient) => {
    console.log("playerFromClient", playersFromClient);
    io.emit("playersMoved", playersFromClient);
  });

  socket.on("startGame", () => {
    io.emit("startGame");
  });
  setInterval(() => {
    let ennemy = {
      position: {
        x: 20,
        y: 20,
      },
      color: "red",
      radius: 5 + Math.ceil(Math.random() * 15),
      speed: {
        x: 1 + Math.floor(Math.random() * 4),
        y: -1 - Math.floor(Math.random() * 4),
      }
    };
    socket.emit('ennemieSend', ennemy);
  }, 1000)
});
