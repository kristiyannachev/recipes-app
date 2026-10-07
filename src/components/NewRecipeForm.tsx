"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import RecipeForm from "@/components/RecipeForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { type FormErrorKey, getFormErrorKey } from "@/lib/form-errors";

export default function NewRecipeForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<FormErrorKey | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorKey(null);
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
        setErrorKey(getFormErrorKey(data, "error.createRecipe"));
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorKey("error.createRecipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorKey(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorKey(getFormErrorKey(data, "error.uploadImage"));
        return;
      }
      setImageUrl(data.url);
    } catch {
      setErrorKey("error.uploadImage");
    } finally {
      setUploading(false);
    }
  }

  return (
    <RecipeForm
      onSubmit={onSubmit}
      error={errorKey ? t(errorKey) : null}
      isSubmitting={loading || uploading}
      submitLabel={loading ? t("form.creating") : t("form.create")}
      onImageChange={handleImageUpload}
      uploading={uploading}
    />
  );
}
