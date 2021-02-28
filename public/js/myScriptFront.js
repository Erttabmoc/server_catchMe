"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");
  const socket = io("http://localhost:8080");

  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Taille du canvas
  canvas.width = 600;
  canvas.height = 400;

  const score = document.getElementById("score");
  const skillsP = document.getElementById("skills");
  const timeSpan = document.getElementById("temps");
  const restart = document.getElementById("restart");
  const button = document.getElementById("button");
  button.addEventListener("click", function () {
    open("/CV/20201110_CV.pdf", "Mon_CV");
  });

  let startTime = false;
  let time = 0;
  let unlockedSkills = 0;
  let ennemies = [];
  let lost = false;

  const crashSound = new Audio();
  crashSound.src = "/sound/ping.mp3";

  const ballsHitSound = new Audio();
  ballsHitSound.src = "/sound/wall.mp3";

  const hitScoreSound = new Audio();
  hitScoreSound.src = "/sound/userScore.mp3";

  // Compétences
  let skills = ["HTML/CSS !", " javaScript !", " Angular !", " MongoDB !"];

  restart.addEventListener("click", function () {
    window.location.reload();
  });

  function showSkills() {
    if (unlockedSkills === 0) {
      skillsP.innerHTML = "Je suis totalement novice...";
    } else {
      skillsP.innerHTML = "Mes compétences en acquisition : ";
    }
    for (let i = 0; i < unlockedSkills; i++) {
      skillsP.style.color = "red";
      skillsP.style.borderColor = "red";
      skillsP.innerHTML += skills[i];
    }
  }

  function chrono() {
    if (startTime) {
      time += 1;
      score.innerHTML = `Vous avez tenu ${time / 100}s`;
    }
    animate();
    showSkills();
  }

  var ennemy = function () {
    this.position = {
      x: 20,
      y: 20,
    };
    this.color = "red";
    this.radius = 5 + Math.ceil(Math.random() * 15);
    this.speed = {
      x: 1 + Math.floor(Math.random() * 4),
      y: -1 - Math.floor(Math.random() * 4),
    };
  };

  ennemy.prototype.drawEnnemy = function () {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  };

  ennemy.prototype.moveEnnemy = function () {
    if (
      this.position.x + this.speed.x > canvas.width - this.radius ||
      this.position.x + this.speed.x < this.radius
    ) {
      // ballsHitSound.play();
      this.speed.x = -this.speed.x;
    }
    if (
      this.position.y + this.speed.y > canvas.height - this.radius ||
      this.position.y + this.speed.y < this.radius
    ) {
      // ballsHitSound.play();
      this.speed.y = -this.speed.y;
    }
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  };

  // Créer le profile des ennemies
  function createEnnemies() {
    for (let i = 0; i < 5; i++) {
      ennemies[i] = new Ennemy();
    }
  }
  createEnnemies();

  // Message
  function drawMessage(msg) {
    ctx.beginPath();
    ctx.font = "40px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    ctx.closePath();
  }

  // Player
  let playerData = {
    position: {
      x: 560,
      y: 360,
    },
    color:
      "rgb(" +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      ")",
    radius: 15,
  };

  function drawPlayer() {
    ctx.beginPath();
    ctx.arc(
      playerData.position.x,
      playerData.position.y,
      playerData.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = playerData.color;
    ctx.fill();
    ctx.closePath();
  }

  let mouseStatement = false;

  // Mouse statement
  function mouseMove(e) {
    if (mouseStatement) {
      playerData.position.x =
        e.pageX - canvas.offsetLeft - playerData.radius / 2;
      playerData.position.y =
        e.pageY - canvas.offsetTop - playerData.radius / 2;
    }
  }

  function mouseClicked(e) {
    if (
      e.pageX < playerData.position.x + playerData.radius + canvas.offsetLeft &&
      e.pageX > playerData.position.x - playerData.radius + canvas.offsetLeft &&
      e.pageY < playerData.position.y + playerData.radius + canvas.offsetTop &&
      e.pageY > playerData.position.y - playerData.radius + canvas.offsetTop
    ) {
      playerData.position.x =
        e.pageX - canvas.offsetLeft - playerData.radius + playerData.radius / 2;
      playerData.position.y =
        e.pageY - canvas.offsetTop - playerData.radius + playerData.radius / 2;
      mouseStatement = true;
      canvas.onmousemove = mouseMove;
      startTime = true;
    }
  }

  function mouseReleased() {
    mouseClicked = false;
    canvas.onmousemove = null;
  }

  canvas.onmousedown = mouseClicked;
  canvas.onmouseup = mouseReleased;

  // Détection des collisions
  function detection() {
    for (let i = 0; i < ennemies.length; i++) {
      let distance = Math.sqrt(
        Math.pow(playerData.position.x - ennemies[i].position.x, 2) +
          Math.pow(playerData.position.y - ennemies[i].position.y, 2)
      );
      if (distance <= playerData.radius + ennemies[i].radius) {
        // crashSound.play();
        lost = true;
      }
    }
  }

  // Game over
  function lostDetection() {
    if (lost) {
      drawMessage("Ahah! You lost!");
      clearInterval(action);
    }
  }

  // Animation (start)
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    if (startTime) {
      ennemies[0].drawEnnemy();
      ennemies[0].moveEnnemy();
    }
    if (time > 200) {
      ennemies[1].drawEnnemy();
      ennemies[1].moveEnnemy();
      if (unlockedSkills === 0) unlockedSkills++;
    }
    if (time > 400) {
      ennemies[2].drawEnnemy();
      ennemies[2].moveEnnemy();
      if (unlockedSkills === 1) unlockedSkills++;
    }
    if (time > 600) {
      ennemies[3].drawEnnemy();
      ennemies[3].moveEnnemy();
      if (unlockedSkills === 2) unlockedSkills++;
    }
    if (time > 800) {
      ennemies[4].drawEnnemy();
      ennemies[4].moveEnnemy();
      // hitScoreSound.play();
      if (unlockedSkills === 3) unlockedSkills++;
    }
    detection();
    lostDetection();
  }
  // Animation (end)

  let action = setInterval(chrono, 1000 / 60);
});
