const sounds = {
	GREETING: "/media/audio/GREETING.mp3",
} as const;

export function playSound(sound: keyof typeof sounds, volume?: number) {
	const audio = new Audio(sounds[sound]);
	if (volume) {
		audio.volume = volume;
	}

	audio.play();
}
