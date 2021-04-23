import { PET_GREEN } from "./consts";

const PADDLE_WIDTH = 60;
const PADDLE_EASING = 0.8;

export default class Paddle {
	constructor(scene) {
		this.view = scene.add.rectangle(400, 360, PADDLE_WIDTH, 20, PET_GREEN);
		this.gameObject = scene.physics.add.existing(this.view);
		this.gameObject.body.setImmovable();

		this.targetX = 400;
		scene.input.on("pointermove", this.onPointerMove.bind(this), this);
	}

	onPointerMove(pointer) {
		//  Keep the paddle within the game
		this.targetX = Phaser.Math.Clamp(
			pointer.x,
			PADDLE_WIDTH / 2,
			800 - PADDLE_WIDTH / 2
		);
	}

	update() {
		this.gameObject.x += (this.targetX - this.gameObject.x) * PADDLE_EASING;
	}
}
