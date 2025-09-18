export type ClipId =
  | "greetings"
  | "impressed"
  | "laughing"
  | "average"
  | "waiting1"
  | "waiting2"
  | "waiting3"
  | "download"
  | "error";
export const manifest = {
  start: "greetings" as ClipId,
  clips: {
    greetings: {
      video: { mp4: "/media/video/greetings.mp4" },
    },
    waiting1: { video: { mp4: "/media/video/waiting-1.mp4" } },
    waiting2: { video: { mp4: "/media/video/waiting-2.mp4" } },
    waiting3: { video: { mp4: "/media/video/waiting-3.mp4" } },
    download: { video: { mp4: "/media/video/download.mp4" } },
    laughing: { video: { mp4: "/media/video/laughing.mp4" } },
    average: { video: { mp4: "/media/video/average.mp4" } },
    impressed: { video: { mp4: "/media/video/impressed.mp4" } },
    error: { video: { mp4: "/media/video/error.mp4" } },
  },
} as const;
