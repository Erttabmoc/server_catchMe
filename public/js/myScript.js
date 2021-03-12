"use strict";
// Au chargement de la page //
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  const socket = io.connect();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Dimensions du canvas
  canvas.width = 600;
  canvas.height = 400;

  const score = document.getElementById("score");
  const restartButton = document.getElementById("restartButton");
  const playButton = document.getElementById("playButton");

  let waitingBox = document.getElementById("waitingBox");
  let playersConnected = document.getElementById("playersConnected");
  let playersOnline = document.getElementById("playersOnline");

  // Relancer le jeu
  restartButton.addEventListener("click", function () {
    window.location.reload();
  });

  // Cacher le bouton au clic
  function hidePlayButton() {
    playButton.style.display = "none";
  }

  let players = [];
  let currentPlayerID;
  let currentPlayerIndex;

  let ennemies = [];
  const pseudo = "Erttabmoc";

  // Connexion des sockets
  socket.on("connect", function () {
    currentPlayerID = socket.id;

    // Réception des données des joueurs
    socket.on("playersOn", function (playersFromServer) {
      players = playersFromServer;
      console.log("Client received players", players);
      if (players.length >= 2) {
        waitingBox.style.display = "none";
        playersConnected.style.display = "list-item";
        for (let i = 0; i < players.length; i++) {
          let createElement = document.createElement("li");
          createElement.innerHTML = players[i].user;
          playersOnline.appendChild(createElement);
        }
      }
    });

    // Initialiser la partie
    playButton.addEventListener("click", () => {
      for (let i = 0; i < players.length; i++) {
        if (players[i].id == currentPlayerID) {
          currentPlayerIndex = i;
          players[currentPlayerIndex].ready = "true";
          hidePlayButton();
          socket.emit("playerReady", players);
          console.log(`Player ${currentPlayerID} is ready to play`);
        }
      }
    });

    let action;

    // Démarrage de la partie lorsque tous les joueurs seront prêts
    socket.on("playerReady", (searchPayersAllReady) => {
      players = searchPayersAllReady;
      let anyPlayer = searchPayersAllReady.some(
        (player) => player.ready == "false"
      );
      if (anyPlayer == false) {
        socket.emit("startChrono");
        console.log("Les lions sont relachés !");
        console.log("Les lions sont relachés !");

        action = setInterval(chrono, 1000 / 60);
      }
    });

    // Lancer le chronomètre
    socket.on("startChrono", () => {
      startTime = true;
    });

    // Dessiner les joueurs
    function drawPlayer() {
      console.log("Players avant de dessiner", players);
      players.forEach(function ({ x, y, radius, color, user }) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "1em Serif";
        ctx.fillText(user, x + 15, y - 15);

        ctx.closePath();
      });
    }

    // Etat de la souris
    canvas.onmousedown = mouseClicked;
    canvas.onmouseup = mouseReleased;

    let mouseStatement = false;
    let currentPlayerIndex;
    let startTime = false;

    // Mouvoir les joeurs
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
            socket.emit("playerClicked", players);
            console.log("Client sent playerClicked");
          }
        }
      }
    }

    // Mises à jour des données des joueurs
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
      }
    }

    // Mises à jour des données des joueurs
    socket.on("playersMoved", (playersFromServer) => {
      players = playersFromServer;
    });

    // Détecter que la souris est relâché
    function mouseReleased() {
      canvas.onmousemove = null;
    }

    // Réception des données des ennemies
    socket.on("ennemiesCreated", (groupOfennemies) => {
      ennemies = groupOfennemies;
      console.log("Client received ennemies", ennemies);
    });

    // Dessiner les ennemies
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

    // Mise à jour des données ennemies
    socket.on("ennemiesUpdate", (ennemiesPos) => {
      ennemies = ennemiesPos;
    });

    const ballsHitSound = new Audio();
    ballsHitSound.src = "../sound/wall.mp3";

    // Détection des collisions avec le canvas
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

    // Détection des collisions avec les joueurs
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
          console.log(`Player ${players[currentPlayerIndex].user} lost !`);
        }
      }
    }

    // Dessiner un message
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
        drawMessage(`Ahah! ${players[currentPlayerIndex].user} lost!`);
        clearInterval(action);
      }
    }

    let time = 0;

    // Lancer la séquence d'animation
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      drawEnnemy();
      detection();
      lostDetection();
      ennemiesCrash();
    }

    // Fonction chronomètre
    function chrono() {
      if (players.length <= 2) {
        if (startTime) {
          time += 1;
          score.innerHTML = `Vous avez tenu <br/> ${time / 100}s`;
        }
        animate();
      }
    }
  });
});
