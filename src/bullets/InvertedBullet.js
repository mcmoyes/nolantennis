import Bullet from "./Bullet";
import { BALL_RADIUS, GREEN } from "../consts";

const COLOR = GREEN;

export default class InvertedBullet extends Bullet {
	constructor(scene, x, y) {
		super(scene, x, y, BALL_RADIUS, COLOR, 1);
		this.setData("type", "inverted");

		const particles = this.scene.add.particles("flares");
		this.emitter = particles.createEmitter({
			frame: "green",
			lifespan: 500,
			speed: 40,
			scale: { start: 0.25, end: 0 },
			alpha: 0.5,
			quantity: 2,
			blendMode: "ADD",
			follow: this,
			on: false,
		});
	}

	fireball() {
		this.emitter.start();
	}

	onHitBrick(brick) {
		this.scene.brickEmitter.explode(20, brick.x, brick.y);
		this.fireball();
	}
}
