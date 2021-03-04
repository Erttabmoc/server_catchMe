"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  let socket = io.connect("http://localhost:8080");
  console.log("socket", socket);

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

  playButton.addEventListener("click", () => {
    socket.emit("startGame");
  });

  socket.on("startGame", () => {
    hidePlayButton();
  });

  function hidePlayButton() {
    playButton.style.display = "none";
  }

  let players = [];
  let currentPlayerID;
  let ennemies = [];

  socket.on("connect", function () {
    currentPlayerID = socket.id;
    console.log("currentPlayerID", currentPlayerID);

    socket.on("playersOn", function (playersFromServer) {
      players = playersFromServer;
      console.log("playersFromServer", playersFromServer);
      console.log("players", players);
      console.log("Client received playersList !");
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
    let index;
    let startTime = false;

    function mouseClicked(e) {
      console.log("Canvas clicked");
      console.log(e);
      for (let i = 0; i < players.length; i++) {
        if (players[i].id == currentPlayerID) {
          index = i;
          console.log("i", i);
          if (
            e.pageX <
              players[index].x + players[index].radius + canvas.offsetLeft &&
            e.pageX >
              players[index].x - players[index].radius + canvas.offsetLeft &&
            e.pageY <
              players[index].y + players[index].radius + canvas.offsetTop &&
            e.pageY >
              players[index].y - players[index].radius + canvas.offsetTop
          ) {
            players[index].x =
              e.pageX -
              canvas.offsetLeft -
              players[index].radius +
              players[index].radius * 0.5;
            players[index].y =
              e.pageY -
              canvas.offsetTop -
              players[index].radius +
              players[index].radius * 0.5;
            mouseStatement = true;
            canvas.onmousemove = mouseMove;
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
    function mouseMove(e) {
      if (mouseStatement) {
        players[index].x =
          e.pageX - canvas.offsetLeft - players[index].radius * 0.5;
        players[index].y =
          e.pageY - canvas.offsetTop - players[index].radius * 0.5;
        socket.emit("mouseMoved", players);
      }
    }

    socket.on("playersMoved", (playersFromServer) => {
      players = playersFromServer;
      console.log("Received playersMoved");
    });

    function mouseReleased() {
      canvas.onmousemove = null;
    }

    socket.on("ennemiesCreated", (groupOfennemies) => {
      ennemies = groupOfennemies;
      console.log("Client received ennemiesCreated");
      console.log("ennemies", ennemies);
    });

    function drawEnnemy(ennemy) {
      ctx.beginPath();
      ctx.arc(ennemy.x, ennemy.y, ennemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = ennemy.color;
      ctx.fill();
      ctx.closePath();
    }

    socket.on("ennemiesUpdate", (ennemiesPos) => {
      animate(ennemiesPos);
      console.log("ennemiesPos", ennemiesPos);
      // console.log("ennemiesPos[0].x", ennemiesPos[0].x);
    });

    update();

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      // drawEnnemy();
      // moveEnnemy();
      requestAnimationFrame(update);
    }

    let time;

    function animate(ennemiesPos) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      if (startTime) {
        drawEnnemy(ennemiesPos[0]);
      }
      if (time > 200) {
        drawEnnemy(ennemiesPos[1]);
        if (unlockedSkills === 0) unlockedSkills++;
      }
      if (time > 400) {
        drawEnnemy(ennemiesPos[2]);
        if (unlockedSkills === 1) unlockedSkills++;
      }
      if (time > 600) {
        drawEnnemy(ennemiesPos[3]);
        if (unlockedSkills === 2) unlockedSkills++;
      }
      if (time > 800) {
        drawEnnemy(ennemiesPos[4]);
        // hitScoreSound.play();
        if (unlockedSkills === 3) unlockedSkills++;
      }
      // detection();
      // lostDetection();
    }

    function chrono() {
      if (players.length >= 2) {
        if (startTime) {
          this.time += 1;
          // score.innerHTML = `Vous avez tenu ${time / 100}s`;
        }
        // animate(ennemiesPos);
        // showSkills();
      }
    }

    let action = setInterval(chrono, 1000 / 60);
  });
});
