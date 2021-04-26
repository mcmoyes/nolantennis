import Phaser from "phaser";
import Paddle from "./Paddle";
import { GREEN_DARKER, GREEN, AMBER } from "./consts";
import TimeBender from "./TimeBender";
import Bullet from "./Bullet";
import AudioController from "./AudioController";
import WebFontFile from "./WebFontFile";

// grid stuff
const WIDTH = 800;
const HEIGHT = 400;
const GRID_COLS = 14;
const GRID_ROWS = 6;
const GRID_MARGINS = {
	x: 60,
	top: 40,
	bottom: 260,
};
const BRICK_PADDING = 8;
const BRICK_WIDTH = (WIDTH - GRID_MARGINS.x * 2) / GRID_COLS - BRICK_PADDING;
const BRICK_HEIGHT =
	(HEIGHT - GRID_MARGINS.top - GRID_MARGINS.bottom) / GRID_ROWS - BRICK_PADDING;

const BALL_INIT = {
	x: 400,
	y: 320,
	radius: 6,
	velocityY: -300,
};

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameScene" });
	}

	init(data) {
		// this.initialZoom = data.zoom;
		this.audioController = new AudioController(this);
		this.lives = data.lives || 3;
		this.level = data.level || 1;
		this.score = data.score || 0;
		this.chanceOfNasty = 0.3 + 0.05 * this.level;
	}

	preload() {
		this.load.addFile(new WebFontFile(this.load, "Press Start 2P"));

		this.load.image("pixel", "assets/pixel.png");
		this.load.image("circle", "assets/circle.png");
		this.load.atlas("flares", "assets/flares.png", "assets/flares.json");
		this.audioController.preloadAssets();
	}

	create() {
		this.audioController.createAssets();

		this.bullets = [];
		this.paddle = new Paddle(this);

		var particles = this.add.particles("pixel");

		this.emitter = particles.createEmitter({
			lifespan: 400,
			speed: { min: -200, max: 200 },
			angle: { min: 0, max: 180 },
			scale: { start: 0.2, end: 0.4, ease: "Quad.easeOut" },
			alpha: { start: 1, end: 0.1, ease: "Quad.easeIn" },
			blendMode: "NORMAL",
			on: false,
		});

		//  Enable world bounds, but disable the floor
		this.physics.world.setBoundsCollision(true, true, true, false);

		this.createBricks();

		this.ballCounter = 0;

		this.ball = this.createBall(
			this.paddle.gameObject.x,
			this.paddle.gameObject.y - 50
		);
		this.bullets.push(this.ball);

		this.ball.setData("onPaddle", true);
		this.ball.body.setVelocity(0, 0);
		this.lerpTime = 0;

		this.timerConfig = {
			delay: 4240 + Math.round(Math.random() * 3) * 1500, // ms
			callback: this.bendTime,
			//args: [],
			callbackScope: this,
			loop: false,
		};
		this.timeBender = new TimeBender(this, this.createInvertedBall.bind(this));
		// set up something for nasty bullets to bounce up against at the bottom.
		this.nastyBouncer = this.add.rectangle(
			WIDTH / 2,
			HEIGHT + 20,
			WIDTH,
			40,
			0x333333,
			0
		);
		this.physics.add.existing(this.nastyBouncer);
		this.nastyBouncer.body.setImmovable();
		this.cameras.main.setZoom(0.01);

		this.cameras.main.zoomTo(1, 500, "Quad");
		this.cameras.main.on("camerazoomcomplete", () => {
			this.begin();
		});
		this.hasBwaaahed = false;
		this.livesText = null;
		this.levelText = null;
		this.scoreText = null;
		this.showLives();
		this.showLevel();
		this.showScore();
	}

	begin() {
		this.input.on("pointermove", this.onPointerMove.bind(this));
		this.input.on("pointerup", this.onPointerUp.bind(this));
		this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
	}

	bendTime() {
		this.audioController.playBendTime();
		this.timeBender.bendTime(this.bullets);
	}

	hitBrick(ball, brick) {
		const colliderMap = brick.getData("colliderMap");

		if (ball.getData("type") !== "inverted-nasty" && brick.alpha !== 0) {
			// disable this collision for all non-reversing balls
			this.bullets.forEach((bullet) => {
				const type = bullet.getData("type");
				const bulletId = bullet.getData("id");
				if (type !== "inverted-nasty") {
					const collider = colliderMap[bulletId];
					if (collider) {
						if (type === "main") {
							this.physics.world.removeCollider(collider);
						}
					}
					this.score += 10;
					this.showScore();
				} else {
					// add collider for inverted-nasty
					colliderMap[bulletId] = this.physics.add.collider(
						bullet,
						brick,
						this.hitBrick,
						null,
						this
					);
					brick.setData("colliderMap", colliderMap);
				}
			});
			// brick.body.enable = false;
			if (ball.getData("type") != "main") {
				this.emitter.explode(20, brick.x, brick.y);
				ball.fireball();
			}
			brick.alpha = 0;
			this.playBrickHit();
		} else if (ball.getData("type") === "inverted-nasty") {
			// nasty bullets replace ones you've hit.
			if (brick.alpha !== 1) {
				this.playBrickHit();
				brick.alpha = 1;

				colliderMap[1] = this.physics.add.collider(
					this.ball,
					brick,
					this.hitBrick,
					null,
					this
				);
				this.physics.world.removeCollider(colliderMap[ball.getData("id")]);
				brick.setData("colliderMap", colliderMap);
			}
		}

		// this.cameras.main.shake(200, 0.005);
		// this.physics.world.timeScale = 2;
		if (this.bricks.every((brick) => brick.alpha == 0)) {
			this.resetLevel(this.level + 1, this.lives, this.score);
		}
	}
	playBrickHit() {
		if (this.hasBwaaahed) {
			this.audioController.playBrickHit();
		} else {
			this.audioController.playBleep();
		}
	}
	onPointerMove(pointer) {
		if (this.ball.getData("onPaddle")) {
			this.ball.x = this.paddle.gameObject.x;
		}
	}

	showLives() {
		const txt = `LIVES: ${this.lives}`;
		if (!this.livesText) {
			this.livesText = this.add.text(GRID_MARGINS.x, 5, txt, {
				fontFamily: '"Press Start 2P"',
				fontSize: "8px",
				color: "#2db300",
			});
		} else {
			this.livesText.text = txt;
		}
	}

	showLevel() {
		const txt = `LEVEL: ${this.level}`;
		if (!this.levelText) {
			this.levelText = this.add.text(800 - GRID_MARGINS.x - 80, 5, txt, {
				fontFamily: '"Press Start 2P"',
				fontSize: "8px",
				color: "#2db300",
			});
		} else {
			this.levelText.text = txt;
		}
	}

	showScore() {
		const txt = `SCORE: ${this.score}`;
		if (!this.scoreText) {
			this.scoreText = this.add.text(400 - 34, 5, txt, {
				fontFamily: '"Press Start 2P"',
				fontSize: "8px",
				color: "#2db300",
			});
		} else {
			this.scoreText.text = txt;
		}
	}

	onPointerUp(pointer) {
		if (this.ball.getData("onPaddle")) {
			this.ball.setData("onPaddle", false);
			this.ball.body.setVelocity(
				Math.random() * 200 - 100,
				BALL_INIT.velocityY
			);

			this.timer = this.time.addEvent(this.timerConfig);
		}
	}

	createBall(x, y, type = "main") {
		const ball = new Bullet(this, x, y, BALL_INIT.radius, 1, type);
		this.ballCounter += 1;
		ball.setData("id", this.ballCounter);

		this.bricks.forEach((brick) => {
			const colliderMap = brick.getData("colliderMap");
			if (
				(type === "main" && brick.alpha == 1) ||
				(type === "inverted-nasty" && brick.alpha === 0)
			) {
				colliderMap[this.ballCounter] = this.physics.add.collider(
					ball,
					brick,
					this.hitBrick,
					null,
					this
				);
			} else if (type == "inverted") {
				colliderMap[this.ballCounter] = this.physics.add.overlap(
					ball,
					this.bricks,
					this.hitBrick,
					null,
					this
				);
			}

			brick.setData("colliderMap", colliderMap);
		});

		this.physics.add.collider(
			ball,
			this.paddle.gameObject,
			this.hitPaddle,
			null,
			this
		);

		if (type === "inverted-nasty") {
			this.physics.add.collider(ball, this.nastyBouncer, null, null, this);
		}
		return ball;
	}

	createBricks() {
		// create bricks
		this.bricks = [];
		for (let i = 0; i < GRID_ROWS; i++) {
			for (let j = 0; j < GRID_COLS; j++) {
				const brick = this.add.rectangle(
					GRID_MARGINS.x + BRICK_WIDTH / 2 + (BRICK_WIDTH + BRICK_PADDING) * j,
					GRID_MARGINS.top +
						BRICK_HEIGHT / 2 +
						(BRICK_HEIGHT + BRICK_PADDING) * i,
					BRICK_WIDTH,
					BRICK_HEIGHT,
					GREEN_DARKER
				);
				brick.setData("colliderMap", {});
				this.bricks.push(brick);
			}
		}

		//  Create the bricks in a 10x6 grid
		this.physics.add.staticGroup(this.bricks);
	}

	hitPaddle(ball, paddle) {
		if (this.hasBwaaahed) {
			this.audioController.playPaddleHit();
		} else {
			this.audioController.playBloop();
		}
		var diff = 0;

		if (ball.x < paddle.x) {
			//  Ball is on the left-hand side of the paddle
			diff = paddle.x - ball.x;
			ball.body.setVelocityX(-10 * diff);
		} else if (ball.x > paddle.x) {
			//  Ball is on the right-hand side of the paddle
			diff = ball.x - paddle.x;
			ball.body.setVelocityX(10 * diff);
		} else {
			//  Ball is perfectly in the middle
			//  Add a little random X to stop it bouncing straight up!
			ball.body.setVelocityX(2 + Math.random() * 8);
		}
		// if (ball.getData("type") === "inverted-nasty") {
		// 	ball.destroy();
		// }
	}

	update(gameTime, delta) {
		this.paddle.update();
		this.timeBender.update(gameTime, delta);
		if (this.ball.y > 400) {
			this.die();
		}
	}

	die() {
		this.audioController.stopMusic();
		this.resetBalls();
		this.timeBender.reset();
		this.resetCamera();
		this.audioController.stopBendTime();
		this.lives -= 1;
		this.showLives();

		if (this.lives == 0) {
			this.scene.start("GameOverScene", { score: this.score });
		}
	}

	resetBalls() {
		this.hasBwaaahed = false;
		this.time.removeEvent(this.timer);
		this.bullets.forEach((bullet) => {
			if (bullet.getData("type") !== "main") {
				bullet.destroy();
			}
		});
		this.bullets = [this.ball];
		this.ball.setPosition(
			this.paddle.gameObject.x,
			this.paddle.gameObject.y - 50
		);
		this.ball.body.setVelocity(0, 0);
		this.ball.setData("onPaddle", true);
	}
	resetLevel(level, lives, score) {
		// this.resetBalls();

		// this.bricks.forEach(function (brick) {
		// 	brick.alpha = 1;
		// });
		this.audioController.stopMusic();
		this.ball.alpha = 0;
		this.time.addEvent({
			delay: 500,
			callback: () => {
				this.scene.restart({ level, lives, score });
			},
		});
	}

	createInvertedBall() {
		if (!this.hasBwaaahed) {
			this.audioController.playMusic();
			this.hasBwaaahed = true;
		}
		this.audioController.stopBendTime();
		this.audioController.playBwaah();
		this.resetCamera();
		let newBall;
		if (Math.random() <= this.chanceOfNasty) {
			// create nasty ball
			newBall = this.createBall(this.ball.x, this.ball.y, "inverted-nasty");
		} else {
			newBall = this.createBall(this.ball.x, this.ball.y, "inverted");
		}
		this.bullets.push(newBall);

		newBall.body.setVelocityX(-this.ball.body.velocity.x * 0.75);
		newBall.body.setVelocityY(-this.ball.body.velocity.y * 0.75);
		newBall.alpha = 0.7;
		// this.physics.world.timeScale = 2;
		this.timer = this.time.addEvent(this.timerConfig);
		this.ball.explodey();
		this.cameras.main.shake(200, 0.005);
	}

	resetCamera() {
		{
			this.cameras.main.stopFollow();
			this.cameras.main.zoomTo(1, 300, "Quad", true);
			this.cameras.main.centerOn(0, 0);
		}
	}
}
