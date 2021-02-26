"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  const socket = io("http://localhost:8080");

  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Taille du canvas
  canvas.width = 600;
  canvas.height = 400;

  const restart = document.getElementById("restart");

  const button = document.getElementById("button");
  button.addEventListener("click", function () {
    open("/misc/20201110_CV.pdf", "Mon_CV");
  });

  let playersData = [];

  const drawPlayers = function () {
    playersData.forEach(function ({ x, y, color, radius }) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    });
  };

  socket.on("playersOn", function (listed) {
    playersData = listed;
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

  // Mouse statement
  function mouseMove(e) {
    if (mouseStatement) {
      // playersData.x = e.pageX - canvas.offsetLeft - playersData.radius / 2;
      // playersData.y = e.pageY - canvas.offsetTop - playersData.radius / 2;
      socket.emit("mouseMoved", { x: playersData.x, y: playersData.y });
    }
  }

  // // Mouse statement
  // function mouseMove(e) {
  //   if (mouseStatement) {
  //     player.position.x = e.pageX - canvas.offsetLeft - player.radius / 2;
  //     player.position.y = e.pageY - canvas.offsetTop - player.radius / 2;
  //     socket.emit('mouseMove', {x: player.position.x, y: player.position.y});
  //   }
  // }

  function mouseClicked(e) {
    if (
      e.pageX < playersData.x + playersData.radius + canvas.offsetLeft &&
      e.pageX > playersData.x - playersData.radius + canvas.offsetLeft &&
      e.pageY < playersData.y + playersData.radius + canvas.offsetTop &&
      e.pageY > playersData.y - playersData.radius + canvas.offsetTop
    ) {
      playersData.x =
        e.pageX - canvas.offsetLeft - playersData.radius + radius / 2;
      playersData.y =
        e.pageY - canvas.offsetTop - playersData.radius + radius / 2;
      mouseStatement = true;
      canvas.onmousemove = mouseMove(e);
      startTime = true;
    }
  }

  function mouseReleased() {
    mouseStatement = false;
    canvas.onmousemove = null;
  }

  canvas.onmousedown = mouseClicked;
  canvas.onmouseup = mouseReleased;
});
