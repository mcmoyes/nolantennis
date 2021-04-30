import Bullet from "./Bullet";
import { BALL_RADIUS, AMBER } from "../consts";

const COLOR = AMBER;

export default class InvertedPaddleBullet extends Bullet {
	constructor(scene, x, y) {
		super(scene, x, y, BALL_RADIUS, COLOR, 1);
		this.setData("type", "inverted-paddle");
	}

	onHitBrick(brick) {}

	onHitPaddle(paddle) {
		this.scene.createInvertedPaddle();
		this.destroy();
	}
}
