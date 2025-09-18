"use client";

import { useState } from "react";
import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";

import { useMutation } from "@tanstack/react-query";
import BackgroundMedia from "./blocks/BackgroundMedia";
import { useVideoStore } from "@/store/VideoStore";
import { ClipId } from "@/libs/videoManifest";
import { AnimatePresence } from "motion/react";
import { HandPopup } from "./blocks/HandPopup";
import HandHistory from "./blocks/HandHistory";

export default function Home() {
	const [isHandHistoryOpen, setIsHandHistoryOpen] = useState(false);
	const [handPopupOpen, setHandPopupOpen] = useState(false);
	const { setActiveVideo, setIsPlaying } = useVideoStore();

	const { mutate: postImage, isPending } = useMutation({
		mutationFn: _postImage,
	});

	const onFiles = async (files: File[]) => {
		const image = files[0];
		if (!image) {
			console.error("No image file provided");
			return;
		}
		setIsPlaying(true);
		setActiveVideo(`waiting${Math.floor(Math.random() * 3) + 1}` as ClipId);
		const binaryData = await image.arrayBuffer();

		try {
			const response = await postImage({ binaryData, contentType: image.type });

			if (response) {
				setActiveVideo(Math.random() < 0.5 ? "impressed" : "laughing");
			} else {
				setActiveVideo("error");
			}
		} catch (error) {
			console.error(error);
			setActiveVideo("error");
		}
	};

	return (
		<section className="h-screen flex-col items-center justify-center gap-4">
			<BackgroundMedia />
			<Dropzone onFiles={onFiles} disabled={isPending} />
			<div className="fixed flex flex-col top-4 right-4 items-end gap-8">
				<button
					onClick={() => setIsHandHistoryOpen(true)}
					className="shadow-lg p-3 text-white/70 bg-white/10 hover:bg-white/20 transition-colors w-fit"
				>
					Hand History
				</button>
				<AnimatePresence>
					{handPopupOpen && <HandPopup handleClose={() => setHandPopupOpen(false)} />}
				</AnimatePresence>
			</div>

			<HandHistory open={isHandHistoryOpen} handleClose={() => setIsHandHistoryOpen(false)} />
		</section>
	);
}
