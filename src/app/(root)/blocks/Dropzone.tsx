"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

type DropzoneProps = {
	onFiles?: (files: File[]) => void;
	accept?: string;
	multiple?: boolean;
	className?: string;
};

export function Dropzone({
	onFiles,
	accept = "image/*",
	multiple = true,
	className = "",
}: DropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isHover, setIsHover] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);

	const acceptedMimePatterns = useMemo(
		() =>
			accept
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		[accept]
	);

	const openFileDialog = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const emitFiles = useCallback(
		(filesList: FileList | File[] | null | undefined) => {
			if (!filesList || (Array.isArray(filesList) && filesList.length === 0)) return;
			const files = Array.from(filesList as FileList);
			const filtered = acceptedMimePatterns.length
				? files.filter((f) =>
						acceptedMimePatterns.some(
							(p) =>
								p === "*/*" ||
								(p.endsWith("/*") ? f.type.startsWith(p.slice(0, -1)) : f.type === p)
						)
				  )
				: files;
			onFiles?.(multiple ? filtered : filtered.slice(0, 1));
		},
		[acceptedMimePatterns, multiple, onFiles]
	);

	const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
		(e) => {
			emitFiles(e.target.files);
			e.target.value = ""; // allow re-selecting same file
		},
		[emitFiles]
	);

	const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
		setIsDragging(true);
	}, []);

	const onDragEnter = useCallback<React.DragEventHandler<HTMLDivElement>>(() => {
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
		// Only reset if we're leaving the root
		if (!rootRef.current) return;
		const rect = rootRef.current.getBoundingClientRect();
		const { clientX, clientY } = e;
		if (
			clientX <= rect.left ||
			clientX >= rect.right ||
			clientY <= rect.top ||
			clientY >= rect.bottom
		) {
			setIsDragging(false);
		}
	}, []);

	const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
		(e) => {
			e.preventDefault();
			setIsDragging(false);
			emitFiles(e.dataTransfer.files);
		},
		[emitFiles]
	);

	const onPaste = useCallback<React.ClipboardEventHandler<HTMLDivElement>>(
		(e) => {
			const files: File[] = [];
			for (const item of Array.from(e.clipboardData.items)) {
				if (item.kind === "file") {
					const f = item.getAsFile();
					if (f) files.push(f);
				}
			}
			if (files.length) {
				emitFiles(files);
			}
		},
		[emitFiles]
	);

	const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
		(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openFileDialog();
			}
		},
		[openFileDialog]
	);

	return (
		<div className={className}>
			<motion.div
				ref={rootRef}
				onPointerEnter={() => setIsHover(true)}
				onPointerLeave={() => setIsHover(false)}
				onDragOver={onDragOver}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onPaste={onPaste}
				onKeyDown={onKeyDown}
				tabIndex={0}
				role="button"
				aria-label="Drop your cards here to get started"
				className="group relative isolate grid h-96 w-full cursor-pointer place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-green-600/40 bg-gradient-to-br from-green-900/20 via-green-800/10 to-emerald-900/20 text-green-100 outline-none transition-all duration-300 hover:border-green-500/60 hover:bg-gradient-to-br hover:from-green-900/30 hover:via-green-800/20 hover:to-emerald-900/30 focus-visible:ring-2 focus-visible:ring-green-400"
				initial={{ scale: 0.98 }}
				animate={{
					scale: isDragging ? 1.02 : isHover ? 1.01 : 1,
					borderColor: isDragging
						? "rgba(34, 197, 94, 0.8)"
						: isHover
						? "rgba(34, 197, 94, 0.6)"
						: "rgba(34, 197, 94, 0.4)",
					boxShadow: isDragging
						? "0 0 0 4px rgba(34, 197, 94, 0.2), 0 20px 60px rgba(0, 0, 0, 0.3)"
						: "0 10px 40px rgba(0, 0, 0, 0.2)",
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			>
				{/* Poker felt texture overlay */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-30"
					style={{
						backgroundImage:
							"radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
					}}
				/>

				<div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
					{/* Poker suits as decorative elements */}
					<div className="flex items-center gap-4 text-3xl opacity-60">
						<span className="text-red-400">♠</span>
						<span className="text-red-500">♥</span>
						<span className="text-green-300">♣</span>
						<span className="text-red-400">♦</span>
					</div>

					<div className="flex flex-col items-center gap-3">
						<h3 className="text-3xl font-bold text-green-50 sm:text-4xl">Drop OR Paste</h3>
						<p className="text-lg text-green-200/80">Your winning hand starts here</p>
					</div>

					<motion.button
						onClick={openFileDialog}
						className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg outline-none transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-green-400"
						type="button"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Deal me in! 🎰
					</motion.button>
				</div>

				<input
					ref={inputRef}
					type="file"
					accept={accept}
					multiple={multiple}
					className="hidden"
					onChange={onInputChange}
				/>
			</motion.div>
		</div>
	);
}
