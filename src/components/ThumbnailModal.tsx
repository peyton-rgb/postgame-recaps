"use client";

import { useState, useRef } from "react";

export function ThumbnailModal({
  athleteName,
  onUpload,
  onCancel,
}: {
  athleteName: string;
  onUpload: (file: File) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    // Accept any image type, including HEIC/HEIF from iOS
    if (!f.type.startsWith("image/") && !f.name.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) return;
    setFile(f);
    // Use object URL for faster, more reliable preview
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    await onUpload(file);
    setUploading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-gray-700 rounded-2xl p-8 w-[400px] max-w-[90vw]"
      >
        <div className="text-xs font-bold uppercase tracking-[2px] text-purple-400 mb-1">
          Video Uploaded
        </div>
        <h2 className="text-lg font-black mb-2">Upload a Thumbnail</h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose an image for{" "}
          <span className="text-white font-bold">{athleteName}</span>&apos;s
          video thumbnail.
        </p>

        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer?.files?.[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-dashed border-gray-700 bg-[#0a0a0a] cursor-pointer flex flex-col items-center justify-center gap-2 mb-6 relative"
        >
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="" />
          ) : (
            <>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs text-gray-500 font-bold">
                Click or drop an image
              </span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-700 rounded-lg text-gray-400 font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="flex-1 px-4 py-3 bg-[#D73F09] rounded-lg text-white font-bold text-sm disabled:opacity-30"
          >
            {uploading ? "Uploading..." : "Use as Thumbnail"}
          </button>
        </div>
      </div>
    </div>
  );
}
