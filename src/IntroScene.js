import WebFontFile from "./WebFontFile";

export default class IntroScene extends Phaser.Scene {
	constructor() {
		super();
	}

	preload() {
		this.load.addFile(new WebFontFile(this.load, "Squada One"));
	}

	create() {
		const title = this.add.text(400, 100, `CHRISTOPHER NOLAN's`, {
			fontFamily: '"Squada One"',
			fontSize: "24px",
		});
		this.tweens.add({
			targets: title,
			duration: 3000,
			scale: 1.2,
		});

		title.setOrigin(0.5, 0.5);
	}
}
