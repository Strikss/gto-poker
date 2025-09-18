// Drag & drop removed from the home screen for now
import VideoDirector from "@/ui/VideoDirector";

import { Dropzone } from "./blocks/Dropzone";
import { _postImage } from "@/api/mutations/_postImage";
import { useMutation } from "@tanstack/react-query";

export default async function Home() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      {/* Background interactive video system */}
      <VideoDirector />
    </section>
  );
}
