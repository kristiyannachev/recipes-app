"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import RecipeImage from "@/components/RecipeImage";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadPreviewProps {
  initialImageUrl?: string | null;
  onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
}

export default function ImageUploadPreview({
  initialImageUrl,
  onImageChange,
  uploading = false,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null,
  );
  const { t } = useLanguage();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        {t("form.image")}
      </label>
      <input
        type="hidden"
        name="existingImageUrl"
        value={initialImageUrl || ""}
      />
      <RecipeImage
        src={previewUrl}
        alt="Recipe preview"
        className="rounded-3xl shadow-xl mb-6"
      />
      <input
        id="recipe-image"
        type="file"
        name="image"
        accept="image/*"
        disabled={uploading}
        onChange={handleImageChange}
        className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
      />
      {uploading && (
        <p className="mt-2 text-sm text-orange-600 font-medium animate-pulse">
          {t("form.uploading")}
        </p>
      )}
    </div>
  );
}
