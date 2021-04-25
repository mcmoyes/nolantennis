import WebFontFile from "./WebFontFile";

export default class GameOverScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameOverScene" });
	}

	init(data) {
		this.score = data.score;
	}

	preload() {
		// this.load.addFile(new WebFontFile(this.load, "Squada One"));
		// this.load.addFile(new WebFontFile(this.load, "Press Start 2P"));
		// this.load.audio("intro", "assets/intro.mp3");
	}

	create() {
		this.cameras.main.zoomTo(1, 0, "Linear", true);
		// this.music = this.sound.add("intro");
		// this.music.play();
		const nolan = this.add.text(400, 120, `YOUR SCORE`, {
			fontFamily: '"Squada One"',
			fontSize: "24px",
		});
		// nolan.setAlpha(0);
		// this.tweens.add({
		// 	targets: nolan,
		// 	duration: 3000,
		// 	scale: 1.1,
		// 	ease: "Cubic",
		// });
		// this.tweens.add({
		// 	targets: nolan,
		// 	duration: 500,
		// 	alpha: 0.8,
		// });

		nolan.setOrigin(0.5, 0.5);
		const score = this.add.text(400, 150, this.score, {
			fontFamily: '"Press Start 2P"',
			fontSize: "64px",
			color: "#2db300",
		});
		score.setOrigin(0.5, 0);

		this.input.on("pointerup", this.transitionToStart.bind(this));
	}

	transitionToStart() {
		this.cameras.main.fadeOut(500);
		this.time.addEvent({
			delay: 1000,
			callback: this.restart,
			callbackScope: this,
		});
	}

	restart() {
		// this.music.stop();
		this.scene.start("IntroScene");
	}
}
