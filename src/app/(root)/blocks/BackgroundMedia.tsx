"use client";

import { playSound } from "@/utils/playSound";
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
	const { isPlaying, setIsPlaying } = useSoundStore();

	const [animateIntro, setAnimateIntro] = useState(false);
	const [revealed, setRevealed] = useState(false);

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

		if (!video) return;

		const INTRO_MS = 3000;
		try {
			video.pause();
			video.currentTime = 0;
			video.loop = true;
		} catch {}

		// trigger transition
		setAnimateIntro(true);
		setTimeout(() => setRevealed(true), 30);
		window.setTimeout(async () => {
			try {
				await Promise.all([video.play(), playSound("GREETING")]);
			} catch {
				// ignore
			}
		}, INTRO_MS);
	}, [setIsPlaying]);

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
