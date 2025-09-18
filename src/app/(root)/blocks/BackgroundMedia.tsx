"use client";

import { shadowsIntoLight } from "@/styles/fonts";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

import { create } from "zustand";

type VideoKeys = "greetings" | "impressed" | "laughing" | "average";

type Store = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  activeVideo: VideoKeys;
  setActiveVideo: (activeVideo: VideoKeys) => void;
};

const useSoundStore = create<Store>()((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  activeVideo: "greetings",
  setActiveVideo: (activeVideo: VideoKeys) => set({ activeVideo }),
}));

export default function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement[]>([]);

  const { isPlaying, setIsPlaying, activeVideo, setActiveVideo } =
    useSoundStore();

  const playVideo = () => {
    setIsPlaying(true);
    videoRef.current[0]?.play();
  };

  const playVideo2 = () => {
    setActiveVideo("impressed");
    videoRef.current[1]?.play();
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
        <AnimatePresence>
          <motion.video
            ref={(el) => {
              videoRef.current[0] = el as HTMLVideoElement;
            }}
            key="greetings"
            src="/media/video/greetings.mp4"
            className="h-full w-full object-contain"
            style={{
              position: "absolute",
              zIndex: activeVideo === "greetings" ? 1 : 2,
              opacity: activeVideo === "greetings" ? 1 : 0,
              maskImage:
                "linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
            }}
            preload="auto"
          />
          <motion.video
            ref={(el) => {
              videoRef.current[1] = el as HTMLVideoElement;
            }}
            key="impressed"
            src="/media/video/impressed.mp4"
            className="h-full w-full object-contain"
            style={{
              zIndex: activeVideo === "impressed" ? 2 : 1,
              position: "absolute",
              opacity: activeVideo === "impressed" ? 1 : 0,
              maskImage:
                "linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
            }}
            preload="auto"
          />
        </AnimatePresence>
      </div>
      <div className="cursor-pointer z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {!isPlaying && (
          <AnimatePresence>
            <motion.button
              type="button"
              onClick={playVideo}
              className={clsx(
                shadowsIntoLight.className,
                "text-4xl rounded-full"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.5 } }}
              transition={{ duration: 3 }}
            >
              Knock the door
            </motion.button>
          </AnimatePresence>
        )}
        {isPlaying && (
          <AnimatePresence>
            <motion.button type="button" onClick={playVideo2} className="">
              Play 2
            </motion.button>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
