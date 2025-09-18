"use client";

import { shadowsIntoLight } from "@/styles/fonts";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { create } from "zustand";

type VideoKeys =
  | "greetings"
  | "impressed"
  | "laughing"
  | "average"
  | "waiting"
  | "download";

type Store = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  activeVideo: VideoKeys;
  setActiveVideo: (activeVideo: VideoKeys) => void;
};

export const useVideoStore = create<Store>()((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  activeVideo: "greetings",
  setActiveVideo: (activeVideo: VideoKeys) => set({ activeVideo }),
}));

const videoKeysMap = {
  greetings: 0,
  impressed: 1,
  laughing: 2,
  average: 3,
  waiting: 4,
  download: 5,
};

export default function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement[]>([]);

  const { isPlaying, setIsPlaying, activeVideo } = useVideoStore();

  const playVideo = () => {
    setIsPlaying(true);
    videoRef.current[videoKeysMap["greetings"]]?.play();
  };

  useEffect(() => {
    videoRef.current[videoKeysMap[activeVideo]]?.play();
  }, [activeVideo]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
        <AnimatePresence>
          <motion.video
            ref={(el) => {
              videoRef.current[videoKeysMap["greetings"]] =
                el as HTMLVideoElement;
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
              videoRef.current[videoKeysMap["waiting"]] =
                el as HTMLVideoElement;
            }}
            key="impressed"
            src="/media/video/waiting.mp4"
            className="h-full w-full object-contain"
            style={{
              zIndex: activeVideo === "waiting" ? 2 : 1,
              position: "absolute",
              opacity: activeVideo === "waiting" ? 1 : 0,
              maskImage:
                "linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
            }}
            preload="auto"
          />
          <motion.video
            ref={(el) => {
              videoRef.current[videoKeysMap["download"]] =
                el as HTMLVideoElement;
            }}
            key="download"
            src="/media/video/download.mp4"
            className="h-full w-full object-contain"
            style={{
              zIndex: activeVideo === "download" ? 2 : 1,
              position: "absolute",
              opacity: activeVideo === "download" ? 1 : 0,
              maskImage:
                "linear-gradient(to right, transparent 0%, black 50%, black 50%, transparent 100%)",
            }}
            preload="auto"
          />
          <motion.video
            ref={(el) => {
              videoRef.current[videoKeysMap["laughing"]] =
                el as HTMLVideoElement;
            }}
            key="laughing"
            src="/media/video/laughing.mp4"
            className="h-full w-full object-contain"
            style={{
              zIndex: activeVideo === "laughing" ? 2 : 1,
              position: "absolute",
              opacity: activeVideo === "laughing" ? 1 : 0,
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
      </div>
    </>
  );
}
