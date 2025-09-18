"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Dropzone } from "./Dropzone";

export default function PokerDropDemo() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		const [first] = files;
		if (!first) return;
		setSelectedFile(first);
		// Prefer object URL for performance over base64
		const url = URL.createObjectURL(first);
		setPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return url;
		});
	}, []);

	const humanSize = useMemo(() => {
		if (!selectedFile) return "";
		const units = ["B", "KB", "MB", "GB"]; // more than enough here
		let size = selectedFile.size;
		let unit = 0;
		while (size >= 1024 && unit < units.length - 1) {
			size /= 1024;
			unit += 1;
		}
		return `${size.toFixed(1)} ${units[unit]}`;
	}, [selectedFile]);

	const clear = useCallback(() => {
		setSelectedFile(null);
		setPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return null;
		});
	}, []);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
			<Dropzone onFiles={handleFiles} accept="image/*" multiple={false} />

			{previewUrl && selectedFile ? (
				<motion.div
					className="mx-auto max-w-2xl rounded-3xl border border-green-600/30 bg-gradient-to-br from-green-900/20 via-green-800/10 to-emerald-900/20 p-6 backdrop-blur-sm"
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring", stiffness: 200, damping: 20 }}
				>
					<div className="flex flex-col gap-6">
						<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-green-600/40 bg-green-950/30">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={previewUrl}
								alt="Your card"
								className="h-full w-full object-contain"
							/>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3">
								<span className="text-2xl">🃏</span>
								<div>
									<h4 className="text-xl font-bold text-green-50">
										{selectedFile.name}
									</h4>
									<p className="text-green-200/80">
										{humanSize} • {selectedFile.type || "mystery card"} 🎲
									</p>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-4">
								<button
									type="button"
									onClick={clear}
									className="inline-flex items-center gap-2 rounded-xl bg-red-600/80 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-500/80 hover:shadow-xl"
								>
									Fold 🚫
								</button>
								<a
									href={previewUrl}
									download={selectedFile.name}
									className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-green-500 hover:to-emerald-500 hover:shadow-xl"
								>
									Cash out! 💰
								</a>
							</div>
						</div>
					</div>
				</motion.div>
			) : (
				<div className="mx-auto max-w-2xl text-center">
					<div className="flex items-center justify-center gap-2 text-lg text-green-300/80">
						<span>🏆</span>
						<span>Pro tip: Paste from clipboard or drag & drop to play your hand</span>
						<span>🎲</span>
					</div>
				</div>
			)}
		</div>
	);
}
