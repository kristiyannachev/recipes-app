"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import RecipeForm from "@/components/RecipeForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewRecipeForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          cookMinutes: formData.get("cookMinutes")
            ? Number(formData.get("cookMinutes"))
            : null,
          categories: formData.getAll("categories"),
          ingredients: formData.get("ingredients"),
          steps: formData.get("steps"),
          sourceUrl: formData.get("sourceUrl"),
          imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create recipe");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <RecipeForm
      onSubmit={onSubmit}
      error={error}
      isSubmitting={loading || uploading}
      submitLabel={loading ? t("form.creating") : t("form.create")}
      onImageChange={handleImageUpload}
      uploading={uploading}
    />
  );
}
