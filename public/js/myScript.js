"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  const socket = io();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 400;

  const score = document.getElementById("score");
  const restartButton = document.getElementById("restartButton");
  const playButton = document.getElementById("playButton");

  let waitingBox = document.getElementById("waitingBox");
  let playersConnected = document.getElementById("playersConnected");
  let playersOnline = document.getElementById("playersOnline");

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
  const pseudo = "Erttabmoc";

  socket.on("connect", function () {
    currentPlayerID = socket.id;

    socket.on("playersOn", function (playersFromServer) {
      players = playersFromServer;
      console.log("Client received players", players);
      if (players.length >= 2) {
        waitingBox.style.display = "none";
        playersConnected.style.display = "list-item";
        for (let i = 0; i < players.length; i++) {
          let createElement = document.createElement("li");
          createElement.innerHTML = players[i].id;
          playersOnline.appendChild(createElement);
        }
      }
    });

    playButton.addEventListener("click", () => {
      for (let i = 0; i < players.length; i++) {
        if (players[i].id == currentPlayerID) {
          currentPlayerIndex = i;
          players[currentPlayerIndex].ready = "true";
          hidePlayButton();
          drawPlayer();
          socket.emit("playerReady", players);
          console.log(`Player ${currentPlayerID} is ready to play`);
        }
      }
    });

    // socket.on("playerReady", (readyPlayers) => {
    //   players = readyPlayers;
    // });

    let action;

    socket.on("playerReady", (searchPayersAllReady) => {
      // console.log("searchPayersAllReady", searchPayersAllReady);
      players = searchPayersAllReady;
      let anyPlayer = searchPayersAllReady.some(
        (player) => player.ready == "false"
      );
      // console.log("anyPlayer", anyPlayer);
      if (anyPlayer == false) {
        // hidePlayButton();
        socket.emit("startChrono");
        console.log("Les lions sont relachés !");
        console.log("Les lions sont relachés !");

        action = setInterval(chrono, 1000 / 60);
      }
    });

    socket.on("startChrono", () => {
      startTime = true;
    });

    function drawPlayer() {
      players.forEach(function ({ x, y, radius, color }) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "1em Serif";
        ctx.fillText(`${players[currentPlayerIndex].id}`, x + 15, y - 15);

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
            console.log("Player clicked");
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
            // startTime = true;
            socket.emit("playerClicked", players);
            console.log("Client sent playerClicked");
          }
        }
      }
    }

    socket.on("playersUpdate", (playersFromServer) => {
      players = playersFromServer;
      console.log("Client received playersUpdate");
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
        // console.log("Player moved");
      }
    }

    socket.on("playersMoved", (playersFromServer) => {
      players = playersFromServer;
      // console.log("Received playersMoved", players);
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
      ennemies = ennemiesPos;
      // console.log("ennemiesPos", ennemiesPos);
    });

    const ballsHitSound = new Audio();
    ballsHitSound.src = "../sound/wall.mp3";

    function ennemiesCrash() {
      ennemies.forEach((ennemy) => {
        if (
          ennemy.x + ennemy.speedX > 600 - ennemy.radius ||
          ennemy.x + ennemy.speedX < ennemy.radius
        ) {
          ballsHitSound.play();
          console.log("ennemyCrash !");
        }
        if (
          ennemy.y + ennemy.speedY > 400 - ennemy.radius ||
          ennemy.y + ennemy.speedY < ennemy.radius
        ) {
          ballsHitSound.play();
          console.log("ennemyCrash !");
        }
      });
    }

    let lost = false;
    const crashSound = new Audio();
    crashSound.src = "../sound/ping.mp3";

    // Détection des collisions
    function detection() {
      for (let i = 0; i < ennemies.length; i++) {
        let distance = Math.sqrt(
          Math.pow(players[currentPlayerIndex].x - ennemies[i].x, 2) +
            Math.pow(players[currentPlayerIndex].y - ennemies[i].y, 2)
        );
        if (
          distance <=
          players[currentPlayerIndex].radius + ennemies[i].radius
        ) {
          console.log("playerCrash !");
          crashSound.play();
          lost = true;
          startTime = false;
          console.log(`Player ${players[currentPlayerIndex].id} lost !`);
        }
      }
    }

    // Message
    function drawMessage(msg) {
      ctx.beginPath();
      ctx.font = "20px Comic Sans MS";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
      ctx.closePath();
    }

    // Game over
    function lostDetection() {
      if (lost) {
        drawMessage(`Ahah! ${players[currentPlayerIndex].id} lost!`);
        clearInterval(action);
      }
    }

    let time = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      drawEnnemy();
      detection();
      lostDetection();
      ennemiesCrash();
    }

    function chrono() {
      if (players.length <= 2) {
        if (startTime) {
          time += 1;
          score.innerHTML = `Vous avez tenu <br/> ${time / 100}s`;
        }
        animate();
      }
    }

    // let action = setInterval(chrono, 1000 / 60);
  });
});
