"use strict";
window.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded");

  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  var players_ready = false;
  // Taille du canvas
  canvas.width = 400;
  canvas.height = 300;

  const score = document.getElementById("score");
  const skillsP = document.getElementById("skills");
  const timeSpan = document.getElementById("temps");
  const restart = document.getElementById("restart");
  const button = document.getElementById("button");
  button.addEventListener("click", function () {
    open("../public/misc/20201110_CV.pdf", "Mon_CV");
  });

  let startTime = false;
  let time = 0;
  let unlockedSkills = 0;
  let ennemies = [];
  let lost = false;

  const crashSound = new Audio();
  crashSound.src = "../public/sounds/ping.mp3";

  const ballsHitSound = new Audio();
  ballsHitSound.src = "../public/sounds/hit.mp3";

  const hitScoreSound = new Audio();
  hitScoreSound.src = "../public/sounds/userScore.mp3";

  // Compétences a supprimer
  let skills = ["HTML/CSS !", " javaScript !", " Angular !", " MongoDB !"];

  restart.addEventListener("click", function () {
    window.location.reload(); // ne fonctionnera pas en multi, reset par server
  });

  // supprimer, show score
  function showSkills() {
    //  when end game and during game
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
    // ONLY when player TWO joins // back or front
    if (startTime) {
      time += 1;
      score.innerHTML = `Vous avez tenu ${time / 100}s`;
    }
    animate();
    showSkills();
  }

  // bien
  var Ennemy = function () {
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
  // bien
  Ennemy.prototype.drawEnnemy = function () {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  };
  // bien
  Ennemy.prototype.moveEnnemy = function () {
    if (
      this.position.x + this.speed.x > canvas.width - this.radius ||
      this.position.x + this.speed.x < this.radius
    ) {
      ballsHitSound.play();
      this.speed.x = -this.speed.x;
    }
    if (
      this.position.y + this.speed.y > canvas.height - this.radius ||
      this.position.y + this.speed.y < this.radius
    ) {
      ballsHitSound.play();
      this.speed.y = -this.speed.y;
    }
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  };

  // Créer le profile des ennemies bien
  function createEnnemies() {
    for (let i = 0; i < 5; i++) {
      ennemies[i] = new Ennemy();
    }
  }
  // create ennemies ONLY w<hen player TWO joins
  createEnnemies();

  // Message bien,
  function drawMessage(msg) {
    ctx.beginPath();
    ctx.font = "40px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    ctx.closePath();
  }

  // player for current user
  // array of other_players ddonc l'array ennemi doit etre check contre un array players
  //
  // Player  BACK AND FRONT
  // my player obj is in front and i send update on its pos to the back
  // opponent obj is in back and back send me update on its pos to draw it
  // my front can ONLY draw the other guy's ball and not modify ity

  let player_opp = {
    position: {
      // get it from back
      x: 20,
      y: 20,
    }, // get it from back

    color:
      "rgb(" +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      "," +
      Math.floor(Math.random() * 255) +
      ")",
    radius: 15, // get it from back
    //joined = false
    update: function () {
      this.position.x += 2;
      this.position.y += 1;
    },
  };

  let player = {
    position: {
      x: 380,
      y: 280,
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
    //joined = false
  };

  //  player two // backend
  // joined = false

  // if player_join // backend
  // if player1.join === true && player2.join === true // backend
  //start

  // doit etre appellé par une fonction qui draw foreach player
  function drawPlayer(player) {
    ctx.beginPath();
    ctx.arc(
      player.position.x,
      player.position.y,
      player.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
  }

  let mouseStatement = false;

  let margin = 20;

  function is_in_bound(pos) {
    if (
      pos.x > canvas.width - margin ||
      pos.x < margin ||
      pos.y > canvas.height - margin ||
      pos.y < margin
    )
      return false;
    return true;
  }

  // desired mouse location
  // true ball location

  // each frame true ball location => desired mouse location // limit

  // Mouse statement
  function mouseMove(e) {
    if (mouseStatement) {
      if (is_in_bound(player.position)) {
        player.position.x = e.pageX - canvas.offsetLeft - player.radius * 2;
        player.position.y = e.pageY - canvas.offsetTop - player.radius * 2;
      }
    }
  }

  function mouseClicked(e) {
    if (
      e.pageX < player.position.x + player.radius + canvas.offsetLeft &&
      e.pageX > player.position.x - player.radius + canvas.offsetLeft &&
      e.pageY < player.position.y + player.radius + canvas.offsetTop &&
      e.pageY > player.position.y - player.radius + canvas.offsetTop
    ) {
      player.position.x =
        e.pageX - canvas.offsetLeft - player.radius + player.radius / 2;
      player.position.y =
        e.pageY - canvas.offsetTop - player.radius + player.radius / 2;
      mouseStatement = true;
      players_ready = true;
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
        Math.pow(player.position.x - ennemies[i].position.x, 2) +
          Math.pow(player.position.y - ennemies[i].position.y, 2)
      );
      if (distance <= player.radius + ennemies[i].radius) {
        crashSound.play();
        lost = true;
        // quel joueru a perdu ?
        // quel a gagné du coup
        //
      }
    }
  }

  // Game over
  // socket emit game-over
  // save score in backend
  function lostDetection() {
    if (lost) {
      drawMessage("Ahah! You lost!");
      clearInterval(action);
    }
  }

  // Animation (start)
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(player);
    drawPlayer(player_opp);
    if (players_ready) player_opp.update();
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
      hitScoreSound.play();
      if (unlockedSkills === 3) unlockedSkills++;
    }
    detection();
    lostDetection();
  }
  // Animation (end)

  let action = setInterval(chrono, 1000 / 60);
});
