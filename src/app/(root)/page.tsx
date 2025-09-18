"use client";

import { useState } from "react";
import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import BackgroundMedia from "./blocks/BackgroundMedia";
import { useVideoStore } from "@/store/VideoStore";
import { ClipId } from "@/libs/videoManifest";
import { AnimatePresence, motion } from "motion/react";
import { HandPopup } from "./blocks/HandPopup";
import HandHistory from "./blocks/HandHistory";

export default function Home() {
	const [isHandHistoryOpen, setIsHandHistoryOpen] = useState(false);
	const [handPopupOpen, setHandPopupOpen] = useState(false);
	const { setActiveVideo, setIsPlaying, activeVideo } = useVideoStore();
	const {
		mutate: postImage,
		isPending,
		data: response,
	} = useMutation({
		mutationFn: _postImage,
	});
	const queryClient = useQueryClient();

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
			postImage(
				{ binaryData, contentType: image.type },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["hands"] });
						setHandPopupOpen(true);
						setActiveVideo(Math.random() < 0.5 ? "impressed" : "laughing");
					},
					onError: () => {
						setActiveVideo("error");
					},
				}
			);
		} catch (error) {
			console.error(error);
			setActiveVideo("error");
		}
	};

	return (
		<section className="h-screen flex-col items-center justify-center gap-4">
			<BackgroundMedia />
			{activeVideo !== "greeting" && <Dropzone onFiles={onFiles} disabled={isPending} />}
			<div className="fixed flex left-4 top-4 right-4 gap-8 z-50">
				<motion.img
					src="/media/img/solvazar.png"
					alt="logo"
					width={150}
					height={150}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, transition: { duration: 1 } }}
					transition={{ duration: 3 }}
					className="self-start"
				/>
				{activeVideo !== "greeting" && (
					<div className="flex flex-col gap-4 ml-auto">
						<button
							onClick={() => setIsHandHistoryOpen(true)}
							className="shadow-lg p-3 text-white/70 bg-white/10 hover:bg-white/20 transition-colors w-fit self-end"
						>
							Hand History
						</button>
						<AnimatePresence>
							{(handPopupOpen || isPending) && (
								<HandPopup
									handleClose={() => setHandPopupOpen(isPending ? true : false)}
									data={response}
								/>
							)}
						</AnimatePresence>
					</div>
				)}
			</div>

			<HandHistory open={isHandHistoryOpen} handleClose={() => setIsHandHistoryOpen(false)} />
		</section>
	);
}
