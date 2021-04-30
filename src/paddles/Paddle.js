const PADDLE_WIDTH = 60;
const PADDLE_EASING = 0.8;

export default class Paddle extends Phaser.GameObjects.Rectangle {
	constructor(scene, color) {
		super(scene, 400, 360, PADDLE_WIDTH, 20, color);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.body.setImmovable();

		this.targetX = 400;
	}

	setXPos(posX) {
		//  Keep the paddle within the game
		this.targetX = Phaser.Math.Clamp(
			posX,
			PADDLE_WIDTH / 2,
			800 - PADDLE_WIDTH / 2
		);
	}

	update() {
		this.x += (this.targetX - this.x) * PADDLE_EASING;
	}
}
