import WebFontFile from "./WebFontFile";

export default class IntroScene extends Phaser.Scene {
	constructor() {
		super({ key: "IntroScene" });
	}

	preload() {
		this.load.addFile(new WebFontFile(this.load, "Squada One"));
		// this.load.audio("intro", "assets/intro.mp3");
	}

	create() {
		// this.music = this.sound.add("intro");
		// this.music.play();
		const nolan = this.add.text(400, 120, `CHRISTOPHER NOLAN's`, {
			fontFamily: '"Squada One"',
			fontSize: "24px",
		});
		nolan.setAlpha(0);
		this.tweens.add({
			targets: nolan,
			duration: 3000,
			scale: 1.1,
			ease: "Cubic",
		});
		this.tweens.add({
			targets: nolan,
			duration: 500,
			alpha: 0.8,
		});

		nolan.setOrigin(0.5, 0.5);
		const titleDef = ["T", "E", "N", "N", "I", "S"];
		const letters = [];
		titleDef.forEach((def, index) => {
			const letter = (letters[index] = this.add.text(
				250 + index * 60,
				150,
				def,
				{
					fontFamily: '"Squada One"',
					fontSize: "64px",
				}
			));
			letter.scaleX = 0;
			letter.setOrigin(0.5, 0);
			this.tweens.add({
				targets: letter,
				scaleX: 1,
				duration: 800,
				delay: 2000 + index * 1000,
			});
		});

		this.time.addEvent({
			delay: 9200,
			callback: this.transitionToStart,
			callbackScope: this,
		});

		this.input.on("pointerdown", this.startGame.bind(this));
	}

	transitionToStart() {
		this.cameras.main.zoomTo(0.01, 500);
		this.time.addEvent({
			delay: 500,
			callback: this.startGame,
			callbackScope: this,
		});
	}

	startGame() {
		// this.music.stop();
		this.scene.start("GameScene", { zoom: this.cameras.main.zoom });
	}
}
