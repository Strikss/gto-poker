"use client";

import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";
import { useMutation } from "@tanstack/react-query";

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
		<section className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
			{isPending && <div>Uploading...</div>}

			<Dropzone onFiles={onFiles} disabled={isPending} />
		</section>
	);
}
