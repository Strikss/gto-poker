"use client";

import { manifest } from "@/libs/videoManifest";
import { poppins } from "@/styles/fonts";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useVideoStore } from "@/store/VideoStore";

export const videoKeysMap = {
  greetings: 0,
  impressed: 1,
  laughing: 2,
  average: 3,
  waiting1: 4,
  waiting2: 5,
  waiting3: 6,
  download: 7,
  error: 8,
};

export default function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement[]>([]);
  const visited = localStorage.getItem("hasVisited") === "true";
  const { isPlaying, setIsPlaying, activeVideo, setActiveVideo } =
    useVideoStore();

  const playVideo = () => {
    setIsPlaying(true);
    try {
      const visited = localStorage.getItem("hasVisited") === "true";
      if (visited) {
        videoRef.current[videoKeysMap[activeVideo]]?.play();
        return;
      }
      localStorage.setItem("hasVisited", "true");
      setActiveVideo("greetings");
      videoRef.current[videoKeysMap["greetings"]]?.play();
    } catch {
      setActiveVideo("greetings");
      videoRef.current[videoKeysMap["greetings"]]?.play();
    }
  };

  useEffect(() => {
    try {
      if (visited) {
        setIsPlaying(false);
        setActiveVideo("average");
      }
    } catch {}
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

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
        <AnimatePresence>
          <motion.video
            ref={(el) => {
              videoRef.current[videoKeysMap[activeVideo]] =
                el as HTMLVideoElement;
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
            onEnded={() => {
              if (activeVideo === "greetings") {
                try {
                  localStorage.setItem("introCompleted", "true");
                } catch {}
                setIsPlaying(false);
                setActiveVideo("average");
              }
            }}
          />
        </AnimatePresence>
      </div>
      <div className="cursor-pointer z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {!isPlaying && activeVideo === "greetings" && (
          <AnimatePresence>
            <motion.button
              type="button"
              onClick={playVideo}
              className={clsx(poppins.className, "text-4xl rounded-full")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.5 } }}
              transition={{ duration: 3 }}
            >
              Knock on the door to enter
            </motion.button>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
