"use client";

import { manifest } from "@/libs/videoManifest";
import { poppins } from "@/styles/fonts";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/VideoStore";

export const videoKeysMap = {
	greeting: 0,
	impressed: 1,
	laughing: 2,
	average: 3,
	waiting1: 4,
	waiting2: 5,
	waiting3: 6,
	download: 7,
	error: 8,
	basic: 9,
};

export default function BackgroundMedia() {
	const videoRef = useRef<HTMLVideoElement[]>([]);
	const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);
	const [hasWaitingLooped, setHasWaitingLooped] = useState<boolean>(false);
	const [initDone, setInitDone] = useState<boolean>(false);
	const { isPlaying, setIsPlaying, activeVideo, setActiveVideo } = useVideoStore();

	const playVideo = () => {
		setIsPlaying(true);
		try {
			const visited = localStorage.getItem("hasVisited") === "true";
			if (visited) {
				videoRef.current[videoKeysMap[activeVideo]]?.play();
				return;
			}
			localStorage.setItem("hasVisited", "true");
			setActiveVideo("greeting");
			videoRef.current[videoKeysMap["greeting"]]?.play();
		} catch {
			setActiveVideo("greeting");
			videoRef.current[videoKeysMap["greeting"]]?.play();
		}
	};

	useLayoutEffect(() => {
		try {
			const visited = localStorage.getItem("hasVisited") === "true";
			if (visited) {
				setIsFirstVisit(false);
				setActiveVideo("basic");
				setIsPlaying(true);
			} else {
				setIsFirstVisit(true);
				setActiveVideo("greeting");
				setIsPlaying(false);
			}
		} catch {}
		setInitDone(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const el = videoRef.current[videoKeysMap[activeVideo]];
		if (!el) return;
		if (isPlaying) {
			el.play().catch(() => {});
		} else {
			el.pause();
		}
	}, [activeVideo, isPlaying]);

	useEffect(() => {
		if (activeVideo === "waiting1" || activeVideo === "waiting2" || activeVideo === "waiting3") {
			setHasWaitingLooped(false);
		}
	}, [activeVideo]);

	return (
		<>
			{initDone && (
				<div
					className={clsx(
						"fixed inset-0 overflow-hidden bg-black",
						isFirstVisit && activeVideo === "greeting" && !isPlaying
							? "pointer-events-auto z-40 cursor-pointer"
							: "pointer-events-none -z-10"
					)}
					onClick={
						isFirstVisit && activeVideo === "greeting" && !isPlaying ? playVideo : undefined
					}
				>
					<AnimatePresence>
						<motion.video
							ref={(el) => {
								videoRef.current[videoKeysMap[activeVideo]] = el as HTMLVideoElement;
							}}
							key={activeVideo}
							src={manifest.clips[activeVideo].video.mp4}
							className="h-full w-full object-contain"
							style={{
								position: "absolute",
								maskImage:
									"linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
							}}
							preload="auto"
							playsInline
							muted={
								activeVideo === "basic" ||
								((activeVideo === "waiting1" ||
									activeVideo === "waiting2" ||
									activeVideo === "waiting3") &&
									hasWaitingLooped)
							}
							autoPlay={isPlaying}
							loop={activeVideo === "basic"}
							onEnded={() => {
								if (activeVideo === "greeting") {
									try {
										localStorage.setItem("introCompleted", "true");
									} catch {}
									setIsFirstVisit(false);
								}
								if (
									activeVideo === "waiting1" ||
									activeVideo === "waiting2" ||
									activeVideo === "waiting3"
								) {
									setHasWaitingLooped(true);
									const el = videoRef.current[videoKeysMap[activeVideo]];
									if (el) {
										el.currentTime = 0;
										el.play().catch(() => {});
									}
									return;
								}
								if (activeVideo !== "basic") {
									setActiveVideo("basic");
									setIsFirstVisit(false);
									setIsPlaying(true);
								}
							}}
						/>
					</AnimatePresence>
				</div>
			)}
			<div className="cursor-pointer z-50 absolute bottom-[90px] left-1/2 -translate-x-1/2 -translate-y-1/2">
				{!isPlaying && activeVideo === "greeting" && (
					<motion.button
						type="button"
						className={clsx(poppins.className, "text-[22px]")}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0, transition: { duration: 1 } }}
						transition={{ duration: 3 }}
					>
						Knock on the door to enter
					</motion.button>
				)}
			</div>
		</>
	);
}
