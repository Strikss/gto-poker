"use client";

import { playSound } from "@/utils/playSound";
import { motion } from "motion/react";
import { useCallback, useRef } from "react";
import { create } from "zustand";

type Store = {
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
};

const useSoundStore = create<Store>()((set) => ({
	isPlaying: false,
	setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
}));

export default function BackgroundMedia() {
	const video1 = useRef<HTMLVideoElement | null>(null);
	const video2 = useRef<HTMLVideoElement | null>(null);
	const { isPlaying, setIsPlaying } = useSoundStore();

	const enableSound = useCallback(async () => {
		setIsPlaying(true);

		const INTRO_MS = 3000;

		setTimeout(async () => {
			playSound("GREETING");
		}, INTRO_MS);
	}, [setIsPlaying]);

	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
			{isPlaying && (
				<motion.video
					ref={video1}
					src="/media/video/initial_video.mp4"
					className="h-full w-full object-contain"
					preload="auto"
					autoPlay
					initial={{ opacity: 0 }}
					animate={{
						opacity: 1,
					}}
					transition={{ duration: 3 }}
				/>
			)}

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
