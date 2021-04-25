import { Tilemaps } from "phaser";

const AUDIO = {
	music: [
		"assets/nolan_music_01.mp3",
		"assets/nolan_music_02.mp3",
		"assets/nolan_music_03.mp3",
		"assets/nolan_music_04.mp3",
		"assets/nolan_music_05.mp3",
	],
	brickHit: [
		"assets/nolan_brick_hit_01.mp3",
		"assets/nolan_brick_hit_02.mp3",
		"assets/nolan_brick_hit_03.mp3",
		"assets/nolan_brick_hit_04.mp3",
		"assets/nolan_brick_hit_05.mp3",
		"assets/nolan_brick_hit_06.mp3",
		"assets/nolan_brick_hit_07.mp3",
	],
	paddle: ["assets/nolan_cursor_bounce.mp3"],
	bloop: ["assets/bloop.mp3"],
	bleep: ["assets/bloopier.mp3"],
	bwaaah: ["assets/bwaaah.mp3"],
	bwaah: ["assets/bwaah.mp3"],
};

export default class AudioController {
	constructor(scene) {
		this.scene = scene;
		this.sounds = {};
		this.musicIndex = -1;
	}

	getId(key, index) {
		return key + index;
	}

	preloadAssets() {
		for (const key of Object.keys(AUDIO)) {
			AUDIO[key].forEach((asset, i) => {
				const id = this.getId(key, i);
				this.scene.load.audio(id, asset);
			});
		}
	}

	createAssets() {
		for (const key of Object.keys(AUDIO)) {
			AUDIO[key].forEach((_, i) => {
				const id = this.getId(key, i);
				this.sounds[id] = this.scene.sound.add(id);
				if (key === "music") {
					this.sounds[id].on("complete", this.playMusic.bind(this));
				}
			});
		}
	}

	playMusic() {
		this.musicIndex++;

		if (this.musicIndex === AUDIO.music.length) {
			this.musicIndex = 0;
		}
		this.sounds[`music${this.musicIndex}`].play();
	}

	stopMusic() {
		if (this.sounds[`music${this.musicIndex}`]) {
			this.sounds[`music${this.musicIndex}`].stop();
		}
	}

	playBrickHit() {
		this.playRandom("brickHit", { volume: 0.3 });
	}

	playPaddleHit() {
		this.playRandom("paddle", { volume: 0.4 });
	}

	playBleep() {
		this.playRandom("bleep", { volume: 0.6 });
	}

	playBloop() {
		this.playRandom("bloop", { volume: 0.6 });
	}

	playBwaaah() {
		this.bwaaah = this.playRandom("bwaaah");
	}
	stopBwaaah() {
		if (this.bwaaah) {
			this.bwaaah.stop();
		}
	}

	playBwaah() {
		this.bwaah = this.playRandom("bwaah");
	}
	stopBwaah() {
		if (this.bwaah) {
			this.bwaah.stop();
		}
	}

	playRandom(key, opts) {
		const index = Math.round(Math.random() * (AUDIO[key].length - 1));
		const id = this.getId(key, index);
		this.sounds[id].play(opts);
		return this.sounds[id];
	}
}
