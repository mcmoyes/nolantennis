import Bullet from "./Bullet";
import { BALL_RADIUS } from "../consts";

const COLOR = 0xffffff;
const TRAIL_MS = 40;

export default class PlayerBullet extends Bullet {
	constructor(scene, x, y) {
		super(scene, x, y, BALL_RADIUS, COLOR, 1);
		this.setData("type", "main");

		this.trail = false;
		this.droppings = [];
	}

	startTrail(ms) {
		this.droppingIndex = 0;
		this.trailTimerConfig = {
			delay: TRAIL_MS, // ms
			callback: this.leaveDropping.bind(this),
			repeat: Math.floor(ms / TRAIL_MS),
		};
		this.scene.time.addEvent(this.trailTimerConfig);
	}

	leaveDropping() {
		const dropping = this.scene.add.circle(
			this.x,
			this.y,
			this.radius,
			this.fillColor,
			(this.fillAlpha - 0.3) /
				(this.trailTimerConfig.repeat - this.droppingIndex)
		);
		this.scene.tweens.add({
			targets: dropping,
			alpha: 0,
			duration: 500,
			delay: 1000,
		});
		this.droppingIndex += 1;
		this.droppings.push(dropping);
	}

	explodey() {
		const ringOuter = this.scene.add.circle(
			this.x,
			this.y,
			this.radius,
			this.fillColor,
			0.6
		);
		const ringInner = this.scene.add.circle(
			this.x,
			this.y,
			this.radius / 2,
			0x000000,
			1
		);
		this.scene.tweens.add({
			targets: [ringOuter, ringInner],
			alpha: 0,
			scale: 30,
			duration: 1000,
			ease: "Cubic",
		});
	}
}
