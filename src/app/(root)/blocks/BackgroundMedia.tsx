"use client";

import { playSound } from "@/utils/playSound";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
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
  const [isPlayingVideo2, setIsPlayingVideo2] = useState(false);
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
      {isPlayingVideo2 ? (
        <motion.video
          ref={video2}
          src="/media/video/video-2.mp4"
          className="h-full w-full object-contain"
          preload="auto"
          autoPlay
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{ duration: 1.5 }}
        />
      ) : (
        <motion.video
          ref={video1}
          onEnded={() => {
            console.log("video1 ended");
            setIsPlayingVideo2(true);
          }}
          src="/media/video/video-1.mp4"
          className="h-full w-full object-contain"
          preload="auto"
          autoPlay={isPlaying}
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
