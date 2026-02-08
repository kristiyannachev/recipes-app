// /Users/kristiyan.nachev/Projects/recipes-app/src/components/ImageUploadPreview.tsx

'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadPreviewProps {
  initialImageUrl?: string | null;
}

export default function ImageUploadPreview({ initialImageUrl }: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const { t } = useLanguage();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== initialImageUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImageUrl]);

  return (
    <div className="sticky top-8">
      <label className="block text-sm font-bold text-emerald-700 mb-2">
        {t('form.image')}
      </label>
      <input
        type="hidden"
        name="existingImageUrl"
        value={initialImageUrl || ''}
      />
      <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-stone-100 mb-6">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Recipe preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">
            🍽️
          </div>
        )}
      </div>
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
      />
    </div>
  );
}
