import Bullet from "./Bullet";
import { BALL_RADIUS, GREEN } from "../consts";

const COLOR = 0x000000;

export default class InvertedNastyBullet extends Bullet {
	constructor(scene, x, y) {
		super(scene, x, y, BALL_RADIUS, COLOR, 1);
		this.setStrokeStyle(2, 0xffffff, 1);
		this.setData("type", "inverted-nasty");

		var particles = this.scene.add.particles("circle");
		this.emitter = particles.createEmitter({
			lifespan: 500,
			speed: 0,
			scale: { start: 0.1, end: 0 },
			alpha: 0.5,
			quantity: 1,
			blendMode: "NORMAL",
			follow: this,
			on: true,
		});
	}
}
