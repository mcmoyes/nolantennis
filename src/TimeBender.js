const SLOWDOWN_DURATION = 1500;//1760;
let t;

export default class TimeBender {
	constructor(scene, onComplete) {
		this.scene = scene;
		this.timer = null;
		this.onComplete = onComplete;
		this.isBending = false;
		this.startTime = 0;
		this.bullets = [];
		this.triggeredComplete = false;
	}

	bendTime(bullets) {
		this.isBending = true;
		this.bullets = bullets;
		this.startTime = this.scene.time.now;
		this.scene.physics.world.timeScale = 2;
		this.scene.cameras.main.zoomTo(1.3, SLOWDOWN_DURATION);
		this.scene.cameras.main.startFollow(bullets[0], true, 0.09, 0.09);
		bullets[0].startTrail(SLOWDOWN_DURATION);
	}

	onBent() {
		this.isBending = false;
		this.scene.physics.world.timeScale = 1;
	}

	update(time, delta) {
		if (this.isBending) {
			// trigger the complete a bit early so we see a bit of the balls splitting in slowmo
			if (
				!this.triggeredComplete &&
				time > this.startTime + SLOWDOWN_DURATION
			) {
				this.onComplete();
				this.triggeredComplete = true;
				return;
			}
			if (time > this.startTime + SLOWDOWN_DURATION + 400) {
				this.onBent();
				this.triggeredComplete = false;
				return;
			}
		}
	}

	reset() {
		this.bullets = [];
		this.isBending = false;
		this.scene.time.removeEvent(this.timer);
	}
}
