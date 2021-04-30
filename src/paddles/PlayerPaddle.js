import Paddle from "./Paddle";
import { GREEN } from "../consts";

export default class PlayerPaddle extends Paddle {
	constructor(scene) {
		super(scene, GREEN);
		scene.input.on("pointermove", this.onPointerMove.bind(this), this);
		this.setDepth(10);
	}

	onPointerMove(pointer) {
		this.setXPos(pointer.x);
	}
}
