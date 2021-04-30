import Paddle from "./Paddle";
import { AMBER } from "../consts";

const CENTER = 400;

export default class InversePaddle extends Paddle {
	constructor(scene) {
		super(scene, 0x000000f);
		scene.input.on("pointermove", this.onPointerMove.bind(this), this);
		this.pivot = CENTER;
		this.setStrokeStyle(2, AMBER, 0.6);
	}

	onPointerMove(pointer) {
		this.setXPos(this.pivot - (pointer.x - this.pivot));
	}
}
