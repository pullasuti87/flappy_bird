let player;
let bgDay;
let ground;
let gameStarted = false;
let gameEnded = false;
let startMenu;
let gameOver;
let restartButton;
let score = 0;
let pipes;
let digitSprite;
let scoreArr = [];
let digitsArr = [];
let scene;

const config = {
  type: Phaser.AUTO,
  width: 285,
  height: 512,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("bg_day", "assets/img/background-day.png");
  this.load.spritesheet("ground", "assets/img/ground-sprite.png", {
    frameWidth: 335,
    frameHeight: 75,
  });

  this.load.image("pipe_top", "assets/img/pipe-green-top.png");
  this.load.image("pipe_bottom", "assets/img/pipe-green-bottom.png");

  this.load.spritesheet("bird", "assets/img/bird-yellow-sprite.png", {
    frameWidth: 34,
    frameHeight: 24,
  });

  this.load.image("start_menu", "assets/img/message-initial.png");
  this.load.image("restart_button", "assets/img/restart-button.png");
  this.load.image("game_over", "assets/img/gameover.png");

  for (let i = 0; i <= 9; i++) {
    this.load.image("number" + i, "assets/img/number" + i + ".png");
  }
}

function create() {
  scene = this;

  // background
  bgDay = this.add.image(144, 256, "bg_day").setInteractive();
  bgDay.on("pointerdown", clickBird);

  // ground
  ground = this.physics.add.sprite(145, config.height, "ground");
  ground.setCollideWorldBounds(true);
  ground.setDepth(10);

  this.anims.create({
    key: "groundMoving",
    frames: this.anims.generateFrameNumbers("ground", {
      start: 0,
      end: 2,
    }),
    frameRate: 10,
    repeat: -1,
  });

  ground.anims.play("groundMoving");

  // player
  this.anims.create({
    key: "flyAndClapWings",
    frames: this.anims.generateFrameNumbers("bird", {
      start: 0,
      end: 2,
    }),
    frameRate: 10,
    repeat: -1,
  });

  player = this.physics.add.sprite(60, 265, "bird");
  player.anims.play("flyAndClapWings");
  this.physics.add.collider(player, ground, handleCollision);

  this.physics.world.setBounds(0, 0, 285, 512);
  player.setCollideWorldBounds(true);

  // start menu
  startMenu = this.add
    .image(config.width / 2, config.height / 2.345, "start_menu")
    .setInteractive()
    .on("pointerdown", startGame);

  pipes = this.physics.add.group();

  pipeInterval = this.time.addEvent({
    delay: 2000,
    callback: spawnPipe,
    callbackScope: this,
    loop: true,
  });

  // game over image
  gameOver = this.add.image(
    config.width / 2,
    config.height / 2.345,
    "game_over",
  );
  gameOver.visible = false;
  gameOver.setDepth(10);

  // restart button
  restartButton = this.add
    .image(config.width / 2, config.height / 1.9, "restart_button")
    .setInteractive()
    .on("pointerdown", restartGame);

  restartButton.visible = false;
  restartButton.setDepth(10);

  digitSprite = this.add.sprite(config.width / 2, config.height / 8, "number0");
  digitSprite.setDepth(10);
  digitSprite.visible = false;
  digitsArr.push(digitSprite);
}

function update() {
  if (gameStarted) {
    if (player.body.velocity.y > 0) {
      player.angle = 25;
    }

    checkScoring();
  }

  if (gameEnded) {
    this.scene.restart();
    gameEnded = false;
  }
}

function clickBird() {
  if (gameStarted) {
    player.angle = -25;
    player.setVelocityY(-150);
  }
}

function startGame() {
  player.setGravityY(300);
  startMenu.visible = false;
  gameStarted = true;
  digitSprite.visible = true;
}

function handleCollision() {
  player.anims.stop();
  player.setGravityY(0);
  player.setVelocityY(0);

  pipes.setVelocityX(0);
  ground.anims.stop();

  gameStarted = false;
  gameOver.visible = true;
  restartButton.visible = true;
}

function spawnPipe() {
  if (gameStarted) {
    // might need to change this
    const pipeTopY = Phaser.Math.Between(-125, config.height / 4);
    // orginally 450
    const pipeBottomY = pipeTopY + 435;

    const scoringPipe = pipes.create(config.width + 20, pipeTopY, "pipe_top");
    pipes.create(config.width + 20, pipeBottomY, "pipe_bottom");

    scoreArr.push(scoringPipe);

    pipes.setVelocityX(-90);

    this.physics.add.overlap(player, pipes, handleCollision, null, this);
  }
}

function restartGame() {
  score = 0;
  scoreArr = [];
  gameEnded = true;
}

function checkScoring() {
  if (pipes.getChildren()[0] !== undefined || scoreArr[0] !== undefined) {
    const removePipe = pipes.getChildren()[0];

    if (removePipe.x < player.x - 100) {
      removePipe.destroy();
    }

    if (scoreArr[0].x < player.x) {
      score++;
      scoreArr.shift();
      displayNumber();
    }
  }
}

function displayNumber() {
  digitsArr.forEach((digit) => {
    digit.destroy();
  });

  digitsArr = [];

  const digits = String(score)
    .split("")
    .map((digit) => parseInt(digit));

  let offset = 0;
  digits.forEach((digit) => {
    digitSprite = scene.add.sprite(
      config.width / 2 + offset,
      config.height / 8,
      "number" + digit,
    );
    offset += digitSprite.width;
    digitsArr.push(digitSprite);
  });
}
