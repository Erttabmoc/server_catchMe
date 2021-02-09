"use strict";
const express = require("express");
const app = express();

app.use("/source", express.static(__dirname + "/public/src"));
app.use("/image", express.static(__dirname + "/public/img"));
app.use("/CV", express.static(__dirname + "/public/misc"));
app.use("/script", express.static(__dirname + "/public/sounds"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const port = 8080;
const server = app.listen(port, function () {
  console.log(`Coonnexion sur le port ${port}`);
});

const socketio = require("socket.io");
const serverio = socketio(server);

const players = [];

serverio.on("connection", (socket) => {
  console.log("Socket connected");
});
