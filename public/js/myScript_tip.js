"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  let socket = io.connect("http://localhost:8080");
  console.log("socket", socket);

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = document.documentElement.clientHeight * 0.8;
  canvas.height = document.documentElement.clientHeight * 0.6;

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

  let players = [];
  let currentPlayerID;

  socket.on("connect", function () {
    currentPlayerID = socket.id;
    console.log("currentPlayerID", currentPlayerID);
  });


  
  socket.on('ennemieSend', (data) => {
    console.log('**********************');
    console.log('data', data);
    console.log('**********************');
  })
  socket.on("playersOn", function (playersFromServer) {
    players = playersFromServer;
    console.log("playersFromServer", playersFromServer);
    console.log("players", players);
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

  function updatePosition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    // socket.emit("playersOn", Object.values(players));
    requestAnimationFrame(updatePosition);
  }

  requestAnimationFrame(updatePosition);
  const drawEnnemy = function (position, radius) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  };

  const moveEnnemy = function (position, speed, radius) {
    if (
      position.x + speed.x > canvas.width - radius ||
      position.x + speed.x < radius
    ) {
      // ballsHitSound.play();
      speed.x = -speed.x;
    }
    if (
      position.y + speed.y > canvas.height - radius ||
      position.y + speed.y < radius
    ) {
      // ballsHitSound.play();
      speed.y = -speed.y;
    }
    position.x += speed.x;
    position.y += speed.y;
  };
  socket.on("startGame", () => {
    hidePlayButton();
  });

  function hidePlayButton() {
    playButton.style.display = "none";
  }

  canvas.onmousedown = mouseClicked;
  canvas.onmouseup = mouseReleased;

  let mouseStatement = false;
  let index;

  function mouseClicked(e) {
    console.log("Canvas clicked");
    console.log(e);
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === currentPlayerID) {
        index = i;
        console.log("i", i);
        if (
          e.pageX <
            players[index].x + players[index].radius + canvas.offsetLeft &&
          e.pageX >
            players[index].x - players[index].radius + canvas.offsetLeft &&
          e.pageY <
            players[index].y + players[index].radius + canvas.offsetTop &&
          e.pageY > players[index].y - players[index].radius + canvas.offsetTop
        ) {
          players[index].x =
            e.pageX -
            canvas.offsetLeft -
            players[index].radius +
            players[index].radius / 2;
          players[index].y =
            e.pageY -
            canvas.offsetTop -
            players[index].radius +
            players[index].radius / 2;
          mouseStatement = true;
          canvas.onmousemove = mouseMove;
          // startTime = true;
          socket.emit("playerClicked", players);
        }
      }
    }
  }

  // Mouse statement
  function mouseMove(e) {
    if (mouseStatement) {
      players[index].x =
        e.pageX - canvas.offsetLeft - players[index].radius * 0.5;
      players[index].y =
        e.pageY - canvas.offsetTop - players[index].radius * 0.5;
      socket.emit("playerMoved", players);
    }
  }
  socket.on('moveAdversaire', (data) => {

  })
  function mouseReleased() {
    canvas.onmousemove = null;
  }
});
