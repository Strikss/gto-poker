"use client";

import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";

import { useMutation } from "@tanstack/react-query";
import BackgroundMedia from "./blocks/BackgroundMedia";

export default function Home() {
	const { mutate: postImage, isPending } = useMutation({
		mutationFn: _postImage,
	});

	const onFiles = async (files: File[]) => {
		const image = files[0];

		if (!image) {
			console.error("No image file provided");
			return;
		}

		const binaryData = await image.arrayBuffer();

		const response = await postImage({ binaryData, contentType: image.type });

		console.log(response);
	};

	return (
		<section className="h-screen flex-col items-center justify-center gap-4">
			<BackgroundMedia />
			<Dropzone onFiles={onFiles} disabled={isPending} />
		</section>
	);
}
