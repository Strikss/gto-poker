"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
};

const useSoundStore = create<Store>()(
	persist(
		(set) => ({
			isPlaying: false,
			setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
		}),
		{
			name: "background-media-storage",
		}
	)
);

export default function BackgroundMedia() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { isPlaying, setIsPlaying } = useSoundStore();

	const [animateIntro, setAnimateIntro] = useState(false);
	const [revealed, setRevealed] = useState(false);

	// No localStorage gating: start on dark screen every visit
	useEffect(() => {
		setAnimateIntro(false);
		setRevealed(false);
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const handleLoaded = () => {
			try {
				video.currentTime = 0;
				video.pause();
			} catch {}
		};
		video.addEventListener("loadeddata", handleLoaded);
		return () => video.removeEventListener("loadeddata", handleLoaded);
	}, []);

	const enableSound = useCallback(async () => {
		setIsPlaying(true);
		const video = videoRef.current;
		let audio = audioRef.current;
		if (!video) return;
		if (!audio) {
			audio = new Audio("/media/audio/GREETING.mp3");
			audioRef.current = audio;
		}
		// Play 3s intro (fade+zoom) first, then start media simultaneously
		const INTRO_MS = 3000;
		// prepare
		try {
			video.pause();
			video.currentTime = 0;
			video.loop = true;
			audio.currentTime = 0;
		} catch {}
		// stop video exactly when audio ends
		if (audio) {
			audio.onended = () => {
				video.pause();
				video.currentTime = 0;
			};
		}
		// trigger transition
		setAnimateIntro(true);
		setTimeout(() => setRevealed(true), 30);
		window.setTimeout(async () => {
			try {
				await Promise.all([video.play(), audio!.play()]);
			} catch {
				// ignore
			}
		}, INTRO_MS);
	}, []);

	// No video-end handling; audio controls final stop
	useEffect(() => {}, []);

	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
			<video
				ref={videoRef}
				src="/media/video/vizard_intro.mp4"
				className="h-full w-full object-contain"
				preload="auto"
				playsInline
				muted={false}
				style={
					animateIntro
						? {
								opacity: revealed ? 1 : 0,
								transform: revealed ? "scale(1)" : "scale(0.9)",
								transition: "opacity 3s ease, transform 3s ease",
						  }
						: { opacity: 0, transform: "scale(0.9)" }
				}
			/>

			<div className="pointer-events-auto absolute bottom-6 right-6">
				{!isPlaying && (
					<button
						type="button"
						onClick={enableSound}
						className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
					>
						Ring the bell
					</button>
				)}
			</div>
		</div>
	);
}
