export default class Bullet extends Phaser.GameObjects.Arc {
	constructor(scene, x, y, radius, fillColor, fillAlpha) {
		super(scene, x, y, radius, 0, 360, false, fillColor, fillAlpha);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCollideWorldBounds(true);
		this.body.setBounce(1);
	}

	onHitPaddle(paddle) {}

	onHitBrick(brick) {}

	destroy() {
		if (this.emitter) {
			this.emitter.stop();
		}
		super.destroy();
	}
}
