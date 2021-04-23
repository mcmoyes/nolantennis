import Phaser from "phaser";
import Paddle from "./Paddle";
import { PET_GREEN_DARKER } from "./consts";
import TimeBender from "./TimeBender";
import Bullet from "./Bullet";

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
class CNT extends Phaser.Scene {
	constructor() {
		super();
	}

	preload() {
		this.load.audio("bloop", "src/assets/bloop.mp3");
		this.load.audio("bleep", "src/assets/bloopier.mp3");
		this.load.audio("bwaaah", "src/assets/shortbwaaah.mp3");
	}

	create() {
		this.sounds = {
			bleep: this.sound.add("bleep"),
			bloop: this.sound.add("bloop"),
			bwaaah: this.sound.add("bwaaah"),
		};
		this.invertedBullets = [];
		this.paddle = new Paddle(this);

		//  Enable world bounds, but disable the floor
		this.physics.world.setBoundsCollision(true, true, true, false);

		this.createBricks();

		this.ball = this.createBall(
			this.paddle.gameObject.x,
			this.paddle.gameObject.y - 50
		);

		this.ball.setData("onPaddle", true);
		this.ball.body.setVelocity(0, 0);
		this.lerpTime = 0;

		this.input.on("pointermove", this.onPointerMove.bind(this));
		this.input.on("pointerup", this.onPointerUp.bind(this));

		this.timerConfig = {
			delay: 4000, // ms
			callback: this.bendTime,
			//args: [],
			callbackScope: this,
			loop: false,
		};
		this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
		this.resetCamera();
		this.timeBender = new TimeBender(this, this.createInvertedBall.bind(this));
	}

	bendTime() {
		this.sounds.bwaaah.play();
		this.timeBender.bendTime([this.ball, ...this.invertedBullets]);
	}

	hitBrick(ball, brick) {
		brick.body.enable = false;
		brick.alpha = 0;
		this.sounds.bleep.play();
		// this.cameras.main.shake(200, 0.005);
		// this.physics.world.timeScale = 2;
		if (this.bricks.every((brick) => brick.alpha == 0)) {
			this.resetLevel();
		}
	}

	onPointerMove(pointer) {
		if (this.ball.getData("onPaddle")) {
			this.ball.x = this.paddle.gameObject.x;
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
		const ball = new Bullet(this, x, y, BALL_INIT.radius, 0xffffff, 1, type);
		this.physics.add.collider(ball, this.bricks, this.hitBrick, null, this);
		this.physics.add.collider(
			ball,
			this.paddle.gameObject,
			this.hitPaddle,
			null,
			this
		);
		return ball;
	}

	createBricks() {
		// create bricks
		this.bricks = [];
		for (let i = 0; i < GRID_ROWS; i++) {
			for (let j = 0; j < GRID_COLS; j++) {
				this.bricks.push(
					this.add.rectangle(
						GRID_MARGINS.x +
							BRICK_WIDTH / 2 +
							(BRICK_WIDTH + BRICK_PADDING) * j,
						GRID_MARGINS.top +
							BRICK_HEIGHT / 2 +
							(BRICK_HEIGHT + BRICK_PADDING) * i,
						BRICK_WIDTH,
						BRICK_HEIGHT,
						PET_GREEN_DARKER
					)
				);
			}
		}

		//  Create the bricks in a 10x6 grid
		this.physics.add.staticGroup(this.bricks);
	}

	hitPaddle(ball, paddle) {
		this.sounds.bloop.play();
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
	}

	update(gameTime, delta) {
		this.paddle.update();
		this.timeBender.update(gameTime, delta);
		if (this.ball.y > 400) {
			this.resetBalls();
		}
	}

	resetBalls() {
		this.time.removeEvent(this.timer);
		this.invertedBullets.forEach((bullet) => {
			bullet.destroy();
		});
		this.invertedBullets = [];
		this.ball.setPosition(
			this.paddle.gameObject.x,
			this.paddle.gameObject.y - 50
		);
		this.ball.body.setVelocity(0, 0);
		this.ball.setData("onPaddle", true);
		this.timeBender.reset();
		this.resetCamera();
	}

	resetLevel() {
		this.resetBalls();

		this.bricks.forEach(function (brick) {
			brick.enableBody(false, 0, 0, true, true);
			brick.alpha = 1;
		});
	}

	createInvertedBall() {
		this.resetCamera();
		const newBall = this.createBall(this.ball.x, this.ball.y, "inverted");
		this.invertedBullets.push(newBall);

		newBall.body.setVelocityX(-this.ball.body.velocity.x / 2);
		newBall.body.setVelocityY(-this.ball.body.velocity.y / 2);
		newBall.alpha = 0.7;
		// this.physics.world.timeScale = 2;
		this.timer = this.time.addEvent(this.timerConfig);
		this.ball.explodey();
		this.cameras.main.shake(200, 0.005);
	}

	resetCamera() {
		{
			this.cameras.main.stopFollow();
			this.cameras.main.zoomTo(1, 300);
			// this.cameras.main.setZoom(1);
			// this.cameras.main.centerOn(0, 0);
		}
	}
}

const config = {
	type: Phaser.AUTO,
	parent: "phaser-example",
	width: 800,
	height: 400,
	scene: CNT,
	physics: {
		default: "arcade",
	},
	audio: {
		disableWebAudio: true,
	},
};

const game = new Phaser.Game(config);
