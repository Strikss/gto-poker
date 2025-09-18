export function preloadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("video");
    let settled = false;

    const onCanPlay = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(el);
    };
    const onError = (e: Event) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(e);
    };
    const cleanup = () => {
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("loadedmetadata", onCanPlay);
      el.removeEventListener("error", onError);
    };

    el.preload = "auto";
    el.src = src;
    el.addEventListener("canplaythrough", onCanPlay, { once: true });
    el.addEventListener("loadedmetadata", onCanPlay, { once: true });
    el.addEventListener("error", onError, { once: true });
    // Kick off loading
    el.load();
  });
}

export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("audio");
    let settled = false;

    const onCanPlay = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(el);
    };
    const onError = (e: Event) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(e);
    };
    const cleanup = () => {
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("loadedmetadata", onCanPlay);
      el.removeEventListener("error", onError);
    };

    el.preload = "auto";
    el.src = src;
    el.addEventListener("canplaythrough", onCanPlay, { once: true });
    el.addEventListener("loadedmetadata", onCanPlay, { once: true });
    el.addEventListener("error", onError, { once: true });
    el.load();
  });
}

export async function prefetchNext(
  clipId: string,
  getClip: (
    id: string
  ) => { video: { mp4: string }; audio?: { src: string } } | undefined
) {
  const next = getClip(clipId);
  if (!next) return;
  try {
    await Promise.all([
      preloadVideo(next.video.mp4).catch(() => undefined),
      next.audio
        ? preloadAudio(next.audio.src).catch(() => undefined)
        : Promise.resolve(undefined),
    ]);
  } catch {
    // best-effort prefetch
  }
}
