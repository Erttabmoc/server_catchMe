"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  let socket = io.connect("http://localhost:8080");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 400;

  const restartButton = document.getElementById("restartButton");
  const playButton = document.getElementById("playButton");

  button.addEventListener("click", function () {
    open("/public/20201110_CV.pdf", "Mon_CV");
  });

  restartButton.addEventListener("click", function () {
    window.location.reload();
  });

  function hidePlayButton() {
    playButton.style.display = "none";
  }

  let players = [];
  let currentPlayerID;
  let currentPlayerIndex;
  let ennemies = [];

  socket.on("connect", function () {
    currentPlayerID = socket.id;

    socket.on("playersOn", function (playersFromServer) {
      players = playersFromServer;
      console.log("players", players);
      console.log("Client received players");
    });

    playButton.addEventListener("click", () => {
      for (let i = 0; i < players.length; i++) {
        if (players[i].id == currentPlayerID) {
          currentPlayerIndex = i;
          players[currentPlayerIndex].ready = "true";
          socket.emit("startGame", players);
          console.log(`Player ${currentPlayerID} is ready to play`);
          console.log("players", players);
        }
      }
    });

    socket.on("startGame", (readyPlayers) => {
      players = readyPlayers;
    });

    socket.on("startGame", (searchPayersAllReady) => {
      console.log("searchPayersAllReady", searchPayersAllReady);
      let anyPlayer = searchPayersAllReady.some(
        (player) => player.ready == "false"
      );
      console.log("anyPlayer", anyPlayer);
      if (anyPlayer == false) {
        hidePlayButton();
      }
    });

    function drawPlayer() {
      players.forEach(function ({ x, y, radius, color }) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      });
    }

    canvas.onmousedown = mouseClicked;
    canvas.onmouseup = mouseReleased;

    let mouseStatement = false;
    let currentPlayerIndex;
    let startTime = false;

    function mouseClicked(e) {
      for (let i = 0; i < players.length; i++) {
        if (players[i].id == currentPlayerID) {
          currentPlayerIndex = i;
          if (
            players[currentPlayerIndex].ready == "true" &&
            e.pageX <
              players[currentPlayerIndex].x +
                players[currentPlayerIndex].radius +
                canvas.offsetLeft &&
            e.pageX >
              players[currentPlayerIndex].x -
                players[currentPlayerIndex].radius +
                canvas.offsetLeft &&
            e.pageY <
              players[currentPlayerIndex].y +
                players[currentPlayerIndex].radius +
                canvas.offsetTop &&
            e.pageY >
              players[currentPlayerIndex].y -
                players[currentPlayerIndex].radius +
                canvas.offsetTop
          ) {
            players[currentPlayerIndex].x =
              e.pageX -
              canvas.offsetLeft -
              players[currentPlayerIndex].radius +
              players[currentPlayerIndex].radius * 0.5;
            players[currentPlayerIndex].y =
              e.pageY -
              canvas.offsetTop -
              players[currentPlayerIndex].radius +
              players[currentPlayerIndex].radius * 0.5;
            mouseStatement = true;
            canvas.onmousemove = playerMove;
            startTime = true;
            socket.emit("playerClicked", players);
            console.log("Client sent playerClicked");
          }
        }
      }
    }

    socket.on("playersUpdate", (playersFromServer) => {
      players = playersFromServer;
      console.log("Received playersUpdate");
    });

    // Mouse statement
    function playerMove(e) {
      if (mouseStatement) {
        players[currentPlayerIndex].x =
          e.pageX -
          canvas.offsetLeft -
          players[currentPlayerIndex].radius * 0.5;
        players[currentPlayerIndex].y =
          e.pageY - canvas.offsetTop - players[currentPlayerIndex].radius * 0.5;
        socket.emit("mouseMoved", players);
      }
    }

    socket.on("playersMoved", (playersFromServer) => {
      players = playersFromServer;
      console.log("Received playersMoved", players);
    });

    function mouseReleased() {
      canvas.onmousemove = null;
    }

    socket.on("ennemiesCreated", (groupOfennemies) => {
      ennemies = groupOfennemies;
      console.log("Client received ennemies", ennemies);
    });

    function drawEnnemy() {
      ennemies.forEach((ennemy) => {
        ctx.beginPath();
        ctx.arc(ennemy.x, ennemy.y, ennemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = ennemy.color;
        ctx.fill();
        ctx.closePath();
      });
    }

    let ennemiesPos;

    socket.on("ennemiesUpdate", (ennemiesPos) => {
      animate(ennemiesPos);
      console.log("ennemiesPos", ennemiesPos);
      // console.log("ennemiesPos[0].x", ennemiesPos[0].x);
    });

    let time;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      if (startTime) {
        drawEnnemy();
      }
      // detection();
      // lostDetection();
    }

    function chrono() {
      if (players.length >= 2) {
        if (startTime) {
          this.time += 1;
          console.log(time);
        }
      }
    }

    let action = setInterval(animate, 1000 / 30);
  });
});
