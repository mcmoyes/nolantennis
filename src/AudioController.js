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
	bendTime: ["assets/bwaaah.mp3"],
	bwaah: ["assets/bwaah.mp3"],
};

const SEQUENCES = {
	brickHit: [
		//0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,
		//6,6,6,6,5,5,5,5,4,4,4,4,3,3,3,3,2,2,2,2,1,1,1,1
		0,1,2,3,4,5,6,5,4,3,2,1
	],
	music: [
		0,0,1,2,0,0,1,2,
		3,3,4,3,4,3,2,2
	],
};

export default class AudioController {
	constructor(scene) {
		this.scene = scene;
		this.sounds = {};
		this.musicIndex = -1;
		this.brickHitIndex = -1;
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

	resetSequences() {
		this.musicIndex = -1;
		this.brickHitIndex = -1;
	}

	playMusic() {
		/*
		this.musicIndex++;
		if (this.musicIndex > SEQUENCES.music.length - 1) {
			this.musicIndex = 0;
		}
		let musicAudioIndex = SEQUENCES.music[this.musicIndex];
		if (musicAudioIndex > AUDIO.music.length - 1) {
			musicAudioIndex = 0;
		}
		this.sounds[`music${musicAudioIndex}`].play({ volume: 0.8 });
		*/
	}

	stopMusic() {
		// called at the end of a round
		let musicAudioIndex = SEQUENCES.music[this.musicIndex];
		if (musicAudioIndex > AUDIO.music.length - 1) {
			musicAudioIndex = 0;
		}
		if (this.sounds[`music${musicAudioIndex}`]) {
			this.sounds[`music${musicAudioIndex}`].stop();
		}
		
		// reset sequences for next round
		this.resetSequences();
	}

	playBrickHit() {
		this.brickHitIndex++;
		if (this.brickHitIndex > SEQUENCES.brickHit.length - 1) {
			this.brickHitIndex = 0;
		}
		let brickHitAudioIndex = SEQUENCES.brickHit[this.brickHitIndex];
		if (brickHitAudioIndex > AUDIO.brickHit.length - 1) {
			brickHitAudioIndex = 0;
		}
		this.sounds[`brickHit${brickHitAudioIndex}`].play({ volume: 0.6 });

		//this.playRandom("brickHit", { volume: 0.8 });
	}

	playPaddleHit() {
		this.playRandom("paddle", { volume: 0.8 });
	}

	playBleep() {
		this.playRandom("bleep", { volume: 0.8 });
	}

	playBloop() {
		this.playRandom("bloop", { volume: 0.8 });
	}


	playBendTime() {
		//this.bendTime = this.playRandom("bendTime");
	}
	stopBendTime() {
		//if (this.bendTime) {
		//	this.bendTime.stop();
		//}
	}

	playBwaah() {
		this.bwaah = this.playRandom("bwaah", { volume: 0.7 });

		// stop current music track
		let musicAudioIndex = SEQUENCES.music[this.musicIndex];
		if (musicAudioIndex > AUDIO.music.length - 1) {
			musicAudioIndex = 0;
		}
		if (this.sounds[`music${musicAudioIndex}`]) {
			this.sounds[`music${musicAudioIndex}`].stop();
		}

		// play next music track
		this.musicIndex++;
		if (this.musicIndex > SEQUENCES.music.length - 1) {
			this.musicIndex = 0;
		}
		let nextMusicAudioIndex = SEQUENCES.music[this.musicIndex];
		if (nextMusicAudioIndex > AUDIO.music.length - 1) {
			nextMusicAudioIndex = 0;
		}
		this.sounds[`music${nextMusicAudioIndex}`].play({ volume: 1 });

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
