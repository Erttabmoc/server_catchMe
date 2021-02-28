"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  const socket = io("http://localhost:8080");

  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Taille du canvas
  canvas.width = 600;
  canvas.height = 400;

  const restartButton = document.getElementById("restartButton");
  const playButton = document.getElementById("playButton");
  button.addEventListener("click", function () {
    open("/misc/20201110_CV.pdf", "Mon_CV");
  });

  let playersData = [];
  var player;
  var startTime;

  function drawPlayers() {
    playersData.forEach(function ({ x, y, color, radius }) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    });
  }

  socket.on("playersOn", function (listed) {
    playersData = listed;
    console.log("Received ", playersData);
  });

  function updatePosition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mouseMove();
    drawPlayers();
    requestAnimationFrame(updatePosition);
  }

  requestAnimationFrame(updatePosition);

  restart.addEventListener("click", function () {
    window.location.reload();
  });

  let mouseStatement = false;
  var starTime;
  var globalPos = { x: 0, y: 0 };

  // Mouse statement
  function mouseMove() {
    if (mouseStatement) {
      playersData.x = globalPos.x;
      playersData.y = globalPos.y;
      socket.emit("mouseMoved", { x: playersData.x, y: playersData.y });
    }
  }

  function mouseClicked(e) {
    // console.log("Mousse clicked !", e.pageX, e.pageY);
    let myPlayer = playersData[0];

    player = myPlayer;

    let tempX = myPlayer.x + myPlayer.radius + canvas.offsetLeft;
    let tempX2 = myPlayer.x - myPlayer.radius + canvas.offsetLeft;
    let tempY = myPlayer.y + myPlayer.radius + canvas.offsetTop;
    let tempY2 = myPlayer.y - myPlayer.radius + canvas.offsetTop;
    // console.log("temPosX", tempX, tempX2);
    // console.log("temPosY", tempY, tempY2);

    if (
      e.pageX < tempX &&
      e.pageX > tempX2 &&
      e.pageY < tempY &&
      e.pageY > tempY2
    ) {
      playerClick(myPlayer, e.pageX, e.pageY);
      console.log("Player clicked !");
    }
  }

  function playerClick(myPlayer, pageX, pageY) {
    myPlayer.x =
      pageX - canvas.offsetLeft - myPlayer.radius + myPlayer.radius * 0.5;
    myPlayer.y =
      pageY - canvas.offsetTop - myPlayer.radius + myPlayer.radius * 0.5;
    mouseStatement = true;

    globalPos.x = pageX - canvas.offsetLeft - myPlayer.radius / 2;
    globalPos.y = pageY - canvas.offsetTop - myPlayer.radius / 2;
    canvas.onmousemove = mouseMove;

    startTime = true;
  }

  function mouseReleased() {
    // mouseStatement = false;
    canvas.onmousemove = null;
  }

  canvas.onmousedown = mouseClicked;
  canvas.onmouseup = mouseReleased;
});
