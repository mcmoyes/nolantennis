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
		"assets/nolan_brick_01.mp3",
		"assets/nolan_brick_02.mp3",
		"assets/nolan_brick_03.mp3",
		"assets/nolan_brick_04.mp3",
		"assets/nolan_brick_05.mp3",
		"assets/nolan_brick_06.mp3",
		"assets/nolan_brick_07.mp3",
	],
	antiBrickHit: [
		"assets/nolan_anti_brick_01.mp3",
		"assets/nolan_anti_brick_02.mp3",
		"assets/nolan_anti_brick_03.mp3",
		"assets/nolan_anti_brick_04.mp3",
		"assets/nolan_anti_brick_05.mp3",
		"assets/nolan_anti_brick_06.mp3",
		"assets/nolan_anti_brick_07.mp3",
	],
	paddle: ["assets/nolan_paddle.mp3"],
	antiPaddle: ["assets/nolan_anti_paddle.mp3"],
	bloop: ["assets/bloop.mp3"],
	bleep: ["assets/bloopier.mp3"],
	bendTime: [
		"assets/nolan_timebend_01.mp3",
		"assets/nolan_timebend_02.mp3",
		"assets/nolan_timebend_03.mp3",
	],
	bwaah: ["assets/bwaah.mp3"],
};

const SEQUENCES = {
	brickHit: [0,1,2,3,4,5,6,5,4,3,2,1],
	music: [0,0,1,0,0,1,2,2,3,3,4,3,4,3,2,2],
};

export default class AudioController {
	constructor(scene) {
		this.scene = scene;
		this.sounds = {};
		this.musicIndex = -1;
		this.musicInstance = null;
		this.brickHitIndex = -1;
		this.recentlyPlayedItemsByKey = {};
		this.musicInstanceStartTimeMS = 0;
		this.numSixteenthNotesPerSecond = 640 / 60; // 160bpm music = 640 16th notes over 60 seconds
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
		if (this.musicInstance) {
			this.musicInstance.stop();
		}
		
		// reset sequences for next round
		this.resetSequences();
	}

	playBrickHit(opts = {}) {
		const pan = typeof opts.pan === 'number' ? opts.pan : 0;
		const soundKey = opts.type === 'inverted-nasty' ? 'antiBrickHit' : 'brickHit';

		this.brickHitIndex++;
		if (this.brickHitIndex > SEQUENCES.brickHit.length - 1) {
			this.brickHitIndex = 0;
		}
		let brickHitAudioIndex = SEQUENCES.brickHit[this.brickHitIndex];
		if (brickHitAudioIndex > AUDIO.brickHit.length - 1) {
			brickHitAudioIndex = 0;
		}

		if (this.musicInstance) {
			// calculate time til next 16th note
			const musicTimeElapsedInSeconds = (performance.now() - this.musicInstanceStartTimeMS) * 0.001;
			const numSixteenthNotesDeep = musicTimeElapsedInSeconds * this.numSixteenthNotesPerSecond;
			const predelayInSeconds = (Math.ceil(numSixteenthNotesDeep) - numSixteenthNotesDeep) / this.numSixteenthNotesPerSecond;
			this.sounds[`${soundKey}${brickHitAudioIndex}`].play({
				volume: 0.7,
				pan,
				delay: predelayInSeconds
			});
		} else {
			// play immediately
			this.sounds[`${soundKey}${brickHitAudioIndex}`].play({
				volume: 0.7,
				pan
			});
		}
	}

	playPaddleHit(opts = {}) {
		//console.log(`playPaddleHit:`, opts);
		const pan = typeof opts.pan === 'number' ? opts.pan : 0;
		const soundKey = opts.type === 'inverted-nasty' ? 'antiPaddle' : 'paddle';
		this.playRandom(soundKey, { volume: 0.7, pan });
	}

	playBleep() {
		this.playRandom("bleep", { volume: 0.7 });
	}

	playBloop() {
		this.playRandom("bloop", { volume: 0.7 });
	}

	playBendTime() {
		this.bendTime = this.playRandomAvoidRepeat("bendTime");
	}
	stopBendTime() {
		if (this.bendTime) {
			this.bendTime.stop();
		}
	}

	playBwaah() {
		this.bwaah = this.playRandom("bwaah", { volume: 0.7 });

		// stop current music track
		if (this.musicInstance) {
			this.musicInstance.stop();
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
		this.musicInstance = this.sounds[`music${nextMusicAudioIndex}`];
		this.musicInstance.play({ volume: 1 });
		this.musicInstanceStartTimeMS = performance.now();

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

	playRandomAvoidRepeat(key, opts) {
		const numItems = AUDIO[key].length;
		
		// init recentlyPlayedItemsByKey[key] if it hasn't been created yet:
		if (typeof this.recentlyPlayedItemsByKey[key] === 'undefined') {
			this.recentlyPlayedItemsByKey[key] = [];
		}

		// splice items from this.recentlyPlayedItemsByKey[key] if there are too many.
		// half the array length is appropriate for random-no-repeat cognitive effectiveness.
		const numToRemove = this.recentlyPlayedItemsByKey[key].length - Math.floor(numItems / 2);
		if (numToRemove > 0) {
			this.recentlyPlayedItemsByKey[key].splice(0, numToRemove);
		}

		// ready to choose a random item from the collection (no repeat if > 1)
		let chosen = null;
		if (numItems === 1) {
			chosen = 0;
		} else if (numItems > 1) {
			let tries = 0;
			do {
				chosen = Math.floor(Math.random() * numItems);
				tries++;
			} while (this.recentlyPlayedItemsByKey[key].indexOf(chosen) > -1 && tries < 50);
		}

		// got a item, add to this.recentlyPlayedItemsByKey[key]
		if (chosen !== null) {
			//console.log('*** recent:', this.recentlyPlayedItemsByKey[key], '...choosing:', chosen);
			this.recentlyPlayedItemsByKey[key].push(chosen);
			const id = this.getId(key, chosen);
			this.sounds[id].play(opts);
			return this.sounds[id];
		} else {
			// couldn't choose a random one after all
			console.warn('playRandomAvoidRepeat(): no item chosen:', AUDIO[key], key);
			return;
		}
	}

}
