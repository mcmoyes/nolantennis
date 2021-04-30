import { BALL_RADIUS } from "../consts";

const COLOR = 0x000000;
const HIT_POINTS = 4;
const HIT_POINTS_CIRCLES_RADIUS = 2;
const HIT_POINTS_CIRCLES_ALPHA = 0.6;

export default class InvertedNastyBullet extends Phaser.GameObjects.Container {
	constructor(scene, x, y) {
		const circle = new Phaser.GameObjects.Arc(
			scene,
			0,
			0,
			BALL_RADIUS,
			0,
			360,
			false,
			COLOR,
			1
		);
		super(scene, x, y, [circle]);
		this.circle = circle;
		this.circle.setStrokeStyle(2, 0xffffff, 1);
		this.circle.setDepth(10);

		scene.add.existing(this);
		this.setSize(BALL_RADIUS * 2, BALL_RADIUS * 2);
		scene.physics.add.existing(this);
		this.body.setCollideWorldBounds(true);
		this.body.setBounce(1);
		this.setData("type", "inverted-nasty");

		this.particles = this.scene.add.particles("circle");
		this.emitter = this.particles.createEmitter({
			lifespan: 500,
			speed: 0,
			scale: { start: 0.1, end: 0 },
			alpha: 0.5,
			quantity: 1,
			blendMode: "NORMAL",
			follow: this,
			on: true,
		});

		this.hitPoints = HIT_POINTS;
		this.hitPointsCircles = [];

		for (let i = 0; i < this.hitPoints; i++) {
			const circle = this.scene.add.circle(
				0,
				0,
				HIT_POINTS_CIRCLES_RADIUS,
				0xffffff,
				HIT_POINTS_CIRCLES_ALPHA
			);
			this.hitPointsCircles.push(circle);
			this.add(circle);
		}
		this.positionHitpoints(0);
		this.scene.tweens.add({
			targets: this,
			rotation: 2 * Math.PI,
			loop: -1,
			duration: 450,
		});
	}

	positionHitpoints(t) {
		const r = BALL_RADIUS + HIT_POINTS_CIRCLES_RADIUS;

		for (let i = 0; i < this.hitPoints; i++) {
			const theta = (i * 2 * Math.PI + t) / this.hitPoints;
			const x = r * Math.sin(theta);
			const y = r * Math.cos(theta);
			this.hitPointsCircles[i].setPosition(x, y);
		}
	}

	update(gameTime, delta) {
		// this.updateDisplayOrigin();
		if (this.body) {
			// this.hitPointsContainer.x = this.x;
			// this.hitPointsContainer.y = this.y;
			// if (this.body.velocity.x < 0) {
			// 	this.hitPointsContainer.rotation -= 0.4;
			// } else {
			// 	this.hitPointsContainer.rotation += 0.4;
			// }
		}
	}

	onHitPaddle(paddle) {
		this.hitPoints -= 1;
		if (this.hitPointsCircles[this.hitPoints]) {
			this.hitPointsCircles[this.hitPoints].destroy();
		}
		if (this.hitPoints < 1) {
			this.die();
		}
	}

	die() {
		const emitter = this.particles.createEmitter({
			lifespan: 400,
			speed: { min: -300, max: 300 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.05, end: 0.2, ease: "Quad.easeOut" },
			alpha: { start: 1, end: 0.5, ease: "Quad.easeIn" },
			blendMode: "NORMAL",
			on: false,
		});
		emitter.explode(50, this.x, this.y);
		this.scene.cameras.main.shake(300, 0.01);
		this.alpha = 0;
		this.body.setVelocity(0);
		this.scene.time.addEvent({
			delay: 400,
			callback: () => {
				this.destroy();
			},
		});
		// this.destroy();
	}

	onHitBrick(brick) {}

	destroy() {
		this.particles.destroy();
		super.destroy();
	}
}
