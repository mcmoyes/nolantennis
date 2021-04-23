const TRAIL_MS = 40;
export default class Bullet extends Phaser.GameObjects.Arc {
	constructor(scene, x, y, radius, fillColor, fillAlpha, type) {
		super(scene, x, y, radius, 0, 360, false, fillColor, fillAlpha);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCollideWorldBounds(true);
		this.body.setBounce(1);
		// .setCollideWorldBounds(true)
		// .setBounce(1);

		this.setData("type", type);
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
			duration: 1000,
			delay: 2000,
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

	update(time, delta) {
		if (this.trail) {
		}
	}
}
