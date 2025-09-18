"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useVideoStore } from "@/store/VideoStore";
import { poppins } from "@/styles/fonts";

type DropzoneProps = {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
};

export function Dropzone({
  onFiles,
  accept = "image/*",
  multiple = true,

  disabled = false,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isPlaying, activeVideo } = useVideoStore();

  const acceptedMimePatterns = useMemo(
    () =>
      accept
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [accept]
  );

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const emitFiles = useCallback(
    (filesList: FileList | File[] | null | undefined) => {
      if (disabled) return;
      if (!filesList || (Array.isArray(filesList) && filesList.length === 0))
        return;
      const files = Array.from(filesList as FileList);
      const filtered = acceptedMimePatterns.length
        ? files.filter((f) =>
            acceptedMimePatterns.some(
              (p) =>
                p === "*/*" ||
                (p.endsWith("/*")
                  ? f.type.startsWith(p.slice(0, -1))
                  : f.type === p)
            )
          )
        : files;
      onFiles?.(multiple ? filtered : filtered.slice(0, 1));
    },
    [acceptedMimePatterns, multiple, onFiles, disabled]
  );

  const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    },
    [disabled]
  );

  const onDragEnter = useCallback<
    React.DragEventHandler<HTMLDivElement>
  >(() => {
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
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
    },
    [disabled]
  );

  const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(false);
      emitFiles(e.dataTransfer.files);
    },
    [emitFiles, disabled]
  );

  const onPaste = useCallback<React.ClipboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
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
    [emitFiles, disabled]
  );

  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFileDialog();
      }
    },
    [openFileDialog, disabled]
  );

  return (
    <motion.div
      className="h-full fixed inset-0"
      ref={rootRef}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Drop your cards here to get started"
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute m-5 inset-0 bg-white/10 border-2 border-dashed border-green-600/40"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          />
        )}
      </AnimatePresence>
      {!isPlaying ||
        (activeVideo === "basic" && (
          <motion.div
            className="pointer-events-none absolute bottom-[60px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 1.5 }}
          >
            <span className={`${poppins.className} text-[22px] text-center`}>
              Drag and drop a screenshot of your poker play
            </span>
          </motion.div>
        ))}
    </motion.div>
  );
}
