"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { motion } from "motion/react";
import { useVideoDirector } from "@/store/videoDirector.store";
import { manifest, type Clip } from "@/libs/videoManifest";

type SyncDeps = {
  videoEl: HTMLVideoElement | null;
  audioEl: HTMLAudioElement | null;
  clip: Clip | undefined;
  isPlaying: boolean;
  onEnded: () => void;
};

function useMediaSync({
  videoEl,
  audioEl,
  clip,
  isPlaying,
  onEnded,
}: SyncDeps) {
  const rafRef = useRef<number | null>(null);
  const vfcRef = useRef<number | null>(null);

  const stopLoops = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (vfcRef.current != null && videoEl) {
      const anyVideo = videoEl as unknown as {
        cancelVideoFrameCallback?: (handle: number) => void;
      };
      if (anyVideo.cancelVideoFrameCallback) {
        anyVideo.cancelVideoFrameCallback(vfcRef.current);
      }
      vfcRef.current = null;
    }
  }, [videoEl]);

  useEffect(() => {
    if (!videoEl) return;
    const hasSeparateAudio = !!clip?.audio;
    videoEl.muted = hasSeparateAudio;
    videoEl.playsInline = true;
    (
      videoEl as unknown as { disablePictureInPicture?: boolean }
    ).disablePictureInPicture = true;
  }, [videoEl, clip]);

  useEffect(() => {
    if (!videoEl || !clip) return;

    let stopped = false;

    const loopCheck = () => {
      if (stopped) return;
      if (!videoEl) return;

      if (clip.audio && audioEl && audioEl.ended) {
        stopped = true;
        stopLoops();
        onEnded();
        return;
      }

      const shouldLoopVideo = !!clip.audio && (clip.loopUntilAudioEnds ?? true);
      if (shouldLoopVideo && videoEl.ended && audioEl && !audioEl.ended) {
        // Instant loop without pause
        try {
          videoEl.currentTime = 0;
          // quick opacity nudge to hide any flash
          videoEl.style.opacity = "0.94";
          void videoEl.play();
          setTimeout(() => {
            if (videoEl) videoEl.style.opacity = "1";
          }, 80);
        } catch {}
      }
    };

    const useVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    if (useVFC) {
      const tick = () => {
        if (!videoEl) return;
        const anyVideo = videoEl as unknown as {
          requestVideoFrameCallback?: (cb: () => void) => number;
        };
        vfcRef.current = anyVideo.requestVideoFrameCallback
          ? anyVideo.requestVideoFrameCallback(() => {
              loopCheck();
              if (!stopped) tick();
            })
          : null;
      };
      tick();
    } else {
      const tick = () => {
        rafRef.current = requestAnimationFrame(() => {
          loopCheck();
          if (!stopped) tick();
        });
      };
      tick();
    }

    const onAudioEnded = () => {
      if (stopped) return;
      stopped = true;
      stopLoops();
      onEnded();
    };
    const onVideoEnded = () => {
      // handled inside loopCheck; keep for safety in no-audio case
      if (!clip.audio) {
        stopped = true;
        stopLoops();
        onEnded();
      }
    };

    if (clip.audio && audioEl) audioEl.addEventListener("ended", onAudioEnded);
    videoEl.addEventListener("ended", onVideoEnded);

    return () => {
      stopped = true;
      if (clip.audio && audioEl)
        audioEl.removeEventListener("ended", onAudioEnded);
      videoEl.removeEventListener("ended", onVideoEnded);
      stopLoops();
    };
  }, [videoEl, audioEl, clip, onEnded, stopLoops]);

  useEffect(() => {
    if (!videoEl || !audioEl) return;
    if (isPlaying) {
      void videoEl.play();
      if (clip?.audio) {
        void audioEl.play();
      } else {
        audioEl.pause();
      }
    } else {
      videoEl.pause();
      audioEl.pause();
    }
  }, [isPlaying, videoEl, audioEl, clip]);
}

export default function VideoDirector() {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [clipEnded, setClipEnded] = useState(false);
  const [activeBuf, setActiveBuf] = useState<"A" | "B">("A");
  const [bufClipId, setBufClipId] = useState<{
    A: string | null;
    B: string | null;
  }>({ A: null, B: null });
  const [hasStarted, setHasStarted] = useState(false);

  const currentClipId = useVideoDirector((s) => s.currentClipId);
  const isPlaying = useVideoDirector((s) => s.isPlaying);
  const volume = useVideoDirector((s) => s.volume);
  const muted = useVideoDirector((s) => s.muted);
  const start = useVideoDirector((s) => s.start);
  // removed unused controls per user's request
  // const play = useVideoDirector((s) => s.play);
  // const pause = useVideoDirector((s) => s.pause);
  // const toggleMute = useVideoDirector((s) => s.toggleMute);
  const onStoreEnded = useVideoDirector((s) => s.onMediaEnded);
  const goTo = useVideoDirector((s) => s.goTo);
  const playNext = useVideoDirector((s) => s.playNextInSequence);

  const clip = useMemo(() => manifest.clips[currentClipId], [currentClipId]);

  // keep audio as master volume (or video if embedded)
  useEffect(() => {
    const a = audioRef.current;
    const v =
      (activeBuf === "A" ? videoARef.current : videoBRef.current) ?? null;
    const vol = muted ? 0 : volume;
    if (clip?.audio) {
      if (a) a.volume = vol;
      if (v) v.volume = 0;
    } else {
      if (v) v.volume = vol;
      if (a) a.volume = 0;
    }
  }, [volume, muted, clip, activeBuf]);

  // Double-buffered loading and seamless crossfade on clip changes
  useEffect(() => {
    const activeRef = activeBuf === "A" ? videoARef.current : videoBRef.current;
    const inactiveRef =
      activeBuf === "A" ? videoBRef.current : videoARef.current;
    const inactiveKey = activeBuf === "A" ? "B" : "A";
    const a = audioRef.current;
    if (!clip) return;

    const loadInto = async (
      target: HTMLVideoElement,
      targetClip: Clip,
      autoplay: boolean,
      attachAudio: boolean
    ) => {
      // pause during load on this buffer
      target.pause();
      target.src = targetClip.video.mp4;
      const videoReady = new Promise<void>((resolve, reject) => {
        const onReady = () => {
          target.removeEventListener("canplay", onReady);
          resolve();
        };
        const onErr = (e: Event) => {
          target.removeEventListener("error", onErr);
          reject(e);
        };
        target.addEventListener("canplay", onReady, { once: true });
        target.addEventListener("error", onErr, { once: true });
        target.load();
      });
      if (attachAudio) {
        if (a) {
          a.pause();
          a.src = targetClip.audio?.src ?? "";
          if (targetClip.audio) {
            await new Promise<void>((resolve) => {
              const onReady = () => {
                a.removeEventListener("canplaythrough", onReady);
                resolve();
              };
              a.addEventListener("canplaythrough", onReady, { once: true });
              a.load();
            });
          }
        }
      }
      await videoReady;
      target.currentTime = 0;
      if (a && attachAudio) a.currentTime = 0;
      if (autoplay) {
        try {
          await target.play();
          if (attachAudio && clip.audio && a) await a.play();
        } catch {}
      } else {
        target.pause();
        if (attachAudio && a) a.pause();
      }
    };

    const run = async () => {
      const wantId = currentClipId;
      const activeHas = bufClipId[activeBuf] === wantId;
      const inactiveHas = bufClipId[inactiveKey] === wantId;
      const wasPlaying = isPlaying;

      if (!activeRef || !inactiveRef) return;

      if (activeHas) {
        // Ensure play/pause state only
        if (wasPlaying) {
          void activeRef.play();
          if (clip.audio && a) void a.play();
        } else {
          activeRef.pause();
          if (a) a.pause();
        }
        return;
      }

      if (!inactiveHas) {
        // Load desired clip into inactive buffer first
        await loadInto(inactiveRef, clip, wasPlaying, true);
        setBufClipId((prev) => ({ ...prev, [inactiveKey]: wantId }));
      }

      // Crossfade: show inactive, hide active
      setActiveBuf(inactiveKey);

      // Pause old active after swap
      setTimeout(() => {
        activeRef.pause();
      }, 0);
    };

    void run();
  }, [currentClipId, isPlaying, clip, activeBuf, bufClipId]);

  useMediaSync({
    videoEl: activeBuf === "A" ? videoARef.current : videoBRef.current,
    audioEl: audioRef.current,
    clip,
    isPlaying,
    onEnded: () => {
      setClipEnded(true);
      onStoreEnded();
    },
  });

  const handleStart = async () => {
    // Single user gesture to start both
    start(manifest.start);
    const v = activeBuf === "A" ? videoARef.current : videoBRef.current;
    const a = audioRef.current;
    try {
      await v?.play();
      if (clip?.audio && a) await a.play();
    } catch {}
    setHasStarted(true);
  };

  const handleSkip = async () => {
    // Skip only the first clip and land on paused state with Play visible
    const v = activeBuf === "A" ? videoARef.current : videoBRef.current;
    const a = audioRef.current;
    v?.pause();
    a?.pause();
    const seq = (manifest.sequence ?? []).filter((id) => id !== manifest.start);
    const first =
      seq[0] ??
      Object.keys(manifest.clips).find((id) => id !== manifest.start) ??
      manifest.start;
    goTo(first as string, { autoplay: false });
    setHasStarted(true);
    setClipEnded(true);
  };

  // Fallback: if media is paused and the active element reports ended, ensure clipEnded=true
  useEffect(() => {
    if (isPlaying) return;
    const v = activeBuf === "A" ? videoARef.current : videoBRef.current;
    const a = audioRef.current;
    const ended = (clip?.audio ? a?.ended : v?.ended) ?? false;
    if (ended) setClipEnded(true);
  }, [isPlaying, activeBuf, clip]);

  // Reset ended flag only when the active clip ID truly changes buffers
  const lastClipIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastClipIdRef.current !== currentClipId) {
      lastClipIdRef.current = currentClipId;
      setClipEnded(false);
    }
  }, [currentClipId]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Double-buffered videos for seamless crossfade */}
      <motion.video
        ref={videoARef}
        className="absolute inset-0 h-full w-full object-contain"
        preload="auto"
        autoPlay={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: activeBuf === "A" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        playsInline
      />
      <motion.video
        ref={videoBRef}
        className="absolute inset-0 h-full w-full object-contain"
        preload="auto"
        autoPlay={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: activeBuf === "B" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        playsInline
      />

      {/* Freeze-frame overlay between videos (not for greetings) */}
      {!isPlaying &&
        (clipEnded || !hasStarted) &&
        currentClipId !== "greetings" && (
          <img
            src="/media/img/start.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />
        )}

      {/* hidden audio element (master clock) */}
      <audio
        ref={audioRef}
        style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
      />

      <div className="pointer-events-auto absolute bottom-6 right-6 flex gap-2">
        {!hasStarted && (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
          >
            Start
          </button>
        )}
        {hasStarted &&
          isPlaying &&
          currentClipId === "greetings" &&
          !clipEnded && (
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-500"
            >
              Skip
            </button>
          )}
        {hasStarted && !isPlaying && clipEnded && (
          <button
            type="button"
            onClick={() => playNext()}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
          >
            Play
          </button>
        )}
      </div>
    </div>
  );
}
