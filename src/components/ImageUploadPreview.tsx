"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import RecipeImage from "@/components/RecipeImage";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadPreviewProps {
  initialImageUrl?: string | null;
  onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
  label?: string;
  previewAlt?: string;
}

export default function ImageUploadPreview({
  initialImageUrl,
  onImageChange,
  uploading = false,
  label,
  previewAlt,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null,
  );
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange?.(e);
    }
  };

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl !== initialImageUrl &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImageUrl]);

  return (
    <div className="sticky top-8">
      <label
        htmlFor="recipe-image"
        className="block text-sm font-bold text-emerald-700 mb-2"
      >
        {label ?? t("form.image")}
      </label>
      <input
        type="hidden"
        name="existingImageUrl"
        value={initialImageUrl || ""}
      />
      <RecipeImage
        src={previewUrl}
        alt={previewAlt ?? t("form.imagePreview")}
        className="rounded-3xl shadow-xl mb-6"
      />
      <input
        ref={inputRef}
        id="recipe-image"
        type="file"
        name="image"
        accept="image/*"
        disabled={uploading}
        onChange={handleImageChange}
        hidden
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-describedby="recipe-image-filename"
          className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {t("form.chooseImage")}
        </button>
        <span
          id="recipe-image-filename"
          className="text-sm text-stone-500 break-all"
        >
          {fileName ||
            t(initialImageUrl ? "form.currentImage" : "form.noImage")}
        </span>
      </div>
      {uploading && (
        <p className="mt-2 text-sm text-orange-600 font-medium animate-pulse">
          {t("form.uploading")}
        </p>
      )}
    </div>
  );
}
