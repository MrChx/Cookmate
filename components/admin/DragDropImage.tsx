"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";

interface DragDropImageProps {
  value: string; // current image URL
  onChange: (url: string) => void;
  label?: string;
}

export default function DragDropImage({ value, onChange, label = "Recipe Image" }: DragDropImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setError("");

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are accepted.");
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-900 mb-1.5">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-4 h-4" /> {label}
        </span>
      </label>

      {value ? (
        // Preview
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = ""; onChange(""); }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-slate-800 font-bold text-sm shadow-lg hover:bg-slate-50 transition"
            >
              <Upload className="w-4 h-4" /> Change
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-xl text-white font-bold text-sm shadow-lg hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        // Drop Zone
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 hover:border-primary hover:bg-primary/5 bg-slate-50"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-600 text-sm font-semibold">Uploading...</p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-primary/15" : "bg-slate-100"}`}>
                <Upload className={`w-8 h-8 transition-colors ${isDragging ? "text-primary" : "text-slate-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-bold text-sm">
                  {isDragging ? "Drop to upload" : "Drag & drop image here"}
                </p>
                <p className="text-slate-500 text-xs mt-1">or click to browse · PNG, JPG, WEBP · max 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="mt-2 text-red-600 text-xs font-semibold">{error}</p>
      )}
    </div>
  );
}
