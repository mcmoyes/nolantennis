import Phaser from "phaser";
import GameScene from "./GameScene";
import IntroScene from "./IntroScene";

const config = {
	type: Phaser.AUTO,
	parent: "phaser-example",
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 800,
		height: 400,
		mode: Phaser.Scale.FIT,
	},
	scene: GameScene,
	physics: {
		default: "arcade",
	},
	audio: {
		disableWebAudio: true,
	},
};

const game = new Phaser.Game(config);
