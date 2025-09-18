// Central manifest describing video/audio clips and transitions

export type ClipId = string;

export type Clip = {
  id: ClipId;
  video: {
    mp4: string;
    webm?: string;
    poster?: string;
  };
  audio?: {
    src: string; // mp3/ogg
  };
  transitions?: Record<string, ClipId>; // user event -> next clip id
  autoNext?: ClipId; // optional auto transition at the end
  /**
   * If true (default), when audio is longer than the video, the video loops
   * seamlessly until audio ends.
   */
  loopUntilAudioEnds?: boolean;
};

export type Manifest = {
  start: ClipId;
  clips: Record<ClipId, Clip>;
  /** Optional sequence to play after the start clip, in order */
  sequence?: ClipId[];
};

// Example manifest using real paths under /public
// Structure: intro (start) -> choose A/B -> each ends and returns to intro

export const manifest: Manifest = {
  start: "greetings",
  sequence: ["average", "impressed", "laughing"],
  clips: {
    greetings: {
      id: "greetings",
      video: {
        mp4: "/media/video/Greetings.mp4",
      },
      // Embedded audio inside the video file; no separate audio source.
      // After it finishes, we will show a button to start 'average'.
      transitions: {
        PLAY_AVERAGE: "average",
      },
    },

    laughing: {
      id: "laughing",
      video: {
        mp4: "/media/video/laughing.mp4",
      },
      audio: {
        src: "/media/audio/GREETING.mp3",
      },
      transitions: {
        BACK: "greetings",
      },
    },

    average: {
      id: "average",
      video: {
        mp4: "/media/video/average.mp4",
      },
      audio: {
        src: "/media/audio/GREETING.mp3",
      },
    },
    impressed: {
      id: "impressed",
      video: {
        mp4: "/media/video/impressed.mp4",
      },
      audio: {
        src: "/media/audio/GREETING.mp3",
      },
    },
  },
};

export type { Manifest as VideoManifest };
