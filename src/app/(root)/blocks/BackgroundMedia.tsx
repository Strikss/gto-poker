"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

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
	const videoRef = useRef<HTMLVideoElement>(null);
	const { isPlaying, setIsPlaying } = useSoundStore();

	const playVideo = () => {
		setIsPlaying(true);
		videoRef.current?.play();
	};

	return (
		<>
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
				<AnimatePresence>
					<motion.video
						ref={videoRef}
						src="/media/video/greetings.mp4"
						className="h-full w-full object-contain"
						style={{
							maskImage:
								"linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
						}}
						preload="auto"
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
						}}
						exit={{ opacity: 0, transition: { duration: 1.5 } }}
						transition={{ duration: 3 }}
					/>
				</AnimatePresence>
			</div>
			<div className="cursor-pointer z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				{!isPlaying && (
					<button
						type="button"
						onClick={playVideo}
						className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
					>
						Knock the door
					</button>
				)}
			</div>
		</>
	);
}
