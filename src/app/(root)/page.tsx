"use client";

import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";

import { useMutation } from "@tanstack/react-query";
import BackgroundMedia from "./blocks/BackgroundMedia";
import { useVideoStore } from "@/store/VideoStore";
import { ClipId } from "@/libs/videoManifest";

export default function Home() {
  const { mutateAsync: postImage, isPending } = useMutation({
    mutationFn: _postImage,
  });
  const { setActiveVideo, setIsPlaying } = useVideoStore();

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
      console.log(response);
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
    </section>
  );
}
