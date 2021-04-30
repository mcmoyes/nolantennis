import Bullet from "./Bullet";
import { BALL_RADIUS, GREEN } from "../consts";

const COLOR = 0x000000;
const HIT_POINTS = 3;
const HIT_POINTS_CIRCLES_RADIUS = 2;
const HIT_POINTS_CIRCLES_ALPHA = 0.4;

export default class InvertedNastyBullet extends Bullet {
	constructor(scene, x, y) {
		super(scene, x, y, BALL_RADIUS, COLOR, 1);
		this.setStrokeStyle(2, 0xffffff, 1);
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

		this.hitPointsContainer = this.scene.add.container(this.x, this.y);

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
			this.hitPointsContainer.add(circle);
		}
		this.positionHitpoints(0);
		this.scene.tweens.add({
			targets: this.hitPointsContainer,
			rotation: 2 * Math.PI,
			loop: -1,
			duration: 500,
		});
	}

	positionHitpoints(t) {
		const r = BALL_RADIUS + 2 + HIT_POINTS_CIRCLES_RADIUS;

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
			this.hitPointsContainer.x = this.x;
			this.hitPointsContainer.y = this.y;

			// if (this.body.velocity.x < 0) {
			// 	this.hitPointsContainer.rotation -= 0.4;
			// } else {
			// 	this.hitPointsContainer.rotation += 0.4;
			// }
		}
	}

	onHitPaddle(paddle) {
		super.onHitPaddle(paddle);
		this.hitPoints -= 1;
		this.hitPointsCircles[this.hitPoints].destroy();
		if (this.hitPoints === 0) {
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

	destroy() {
		this.hitPointsContainer.destroy();
		super.destroy();
	}
}
