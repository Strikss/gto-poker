import { ClipId } from "@/libs/videoManifest";
import { create } from "zustand";

export type VideoStore = {
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
	activeVideo: ClipId;
	setActiveVideo: (activeVideo: ClipId) => void;
};

export const useVideoStore = create<VideoStore>()((set) => ({
	isPlaying: false,
	setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
	activeVideo: "greeting",
	setActiveVideo: (activeVideo: ClipId) => set({ activeVideo }),
}));
