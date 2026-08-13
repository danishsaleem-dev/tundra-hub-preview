"use client";

import { useRef, useState } from "react";
import { Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormLabel } from "@/components/FormLabel";

export interface FileUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  label,
  hint = "PDF, PNG, or JPG up to 10MB",
  accept,
  multiple = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setFiles((prev) => (multiple ? [...prev, ...Array.from(list)] : [list[0]]));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <FormLabel>{label}</FormLabel> : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver
            ? "border-brand-blue bg-brand-blue/5"
            : "border-card-tint hover:bg-page-bg",
        )}
      >
        <Upload className="h-5 w-5 text-neutral-text" />
        <p className="text-sm font-medium text-[#0B1330]">
          Click to upload{" "}
          <span className="font-normal text-neutral-text">
            or drag and drop
          </span>
        </p>
        <p className="text-xs text-neutral-text">{hint}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => addFiles(event.target.files)}
      />
      {files.length > 0 ? (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-card-tint bg-white px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileIcon className="h-4 w-4 shrink-0 text-neutral-text" />
                <span className="truncate text-[#0B1330]">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="shrink-0 text-neutral-text hover:text-critical-text"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
