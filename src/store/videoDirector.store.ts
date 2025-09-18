import { create } from "zustand";
import { manifest, type ClipId } from "@/libs/videoManifest";

type DirectorState = {
  currentClipId: ClipId;
  isPlaying: boolean;
  volume: number; // 0..1
  muted: boolean;
  sequenceIndex: number; // -1 before starting sequence
};

type DirectorActions = {
  start: (startClipId?: ClipId) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  trigger: (event: string) => void; // user event transitions
  onMediaEnded: () => void; // audio ended or video-only ended
  goTo: (id: ClipId, options?: { autoplay?: boolean }) => void; // switch clip
  playNextInSequence: () => void; // advance through manifest.sequence
};

export type DirectorStore = DirectorState & DirectorActions;

const initialState: DirectorState = {
  currentClipId: manifest.start,
  isPlaying: false,
  volume: 1,
  muted: false,
  sequenceIndex: -1,
};

export const useVideoDirector = create<DirectorStore>()((set, get) => ({
  ...initialState,

  start: (startClipId) => {
    const nextId: ClipId = startClipId ?? manifest.start;
    set({ currentClipId: nextId, isPlaying: true, sequenceIndex: 0 });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),

  trigger: (event: string) => {
    const { currentClipId } = get();
    const clip = manifest.clips[currentClipId];
    const next = clip?.transitions?.[event];
    if (next && manifest.clips[next]) {
      set({ currentClipId: next, isPlaying: true });
    }
  },

  onMediaEnded: () => {
    const { currentClipId } = get();
    const clip = manifest.clips[currentClipId];
    const auto = clip?.autoNext;
    if (auto && manifest.clips[auto]) {
      set({ currentClipId: auto, isPlaying: true });
    } else {
      // Stop at the end if no autoNext
      set({ isPlaying: false });
    }
  },

  goTo: (id, options) => {
    if (!manifest.clips[id]) return;
    const autoplay = options?.autoplay ?? true;
    set({ currentClipId: id, isPlaying: autoplay });
  },

  playNextInSequence: () => {
    const { sequenceIndex } = get();
    const baseSeq = manifest.sequence ?? [];
    const seq = baseSeq.filter((id) => id !== manifest.start);
    if (seq.length === 0) return;
    const normalized = sequenceIndex < 0 ? 0 : sequenceIndex;
    const nextIdx = normalized % seq.length;
    const nextId = seq[nextIdx];
    if (!manifest.clips[nextId]) return;
    set({ currentClipId: nextId, isPlaying: true, sequenceIndex: nextIdx + 1 });
  },
}));
