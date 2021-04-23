const SLOWDOWN_DURATION = 1760;
let t;

export default class TimeBender {
	constructor(scene, onComplete) {
		this.scene = scene;
		this.timer = null;
		this.onComplete = onComplete;
		this.isBending = false;
		this.startTime = 0;
		this.bullets = [];
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

		this.onComplete();
	}

	update(time, delta) {
		if (this.isBending) {
			if (time > this.startTime + SLOWDOWN_DURATION) {
				this.onBent();
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
