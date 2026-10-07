"use client";

import type { Recipe } from "@prisma/client";
import { type FormEvent, useState } from "react";
import RecipeForm from "@/components/RecipeForm";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FormErrorKey } from "@/lib/form-errors";

export default function EditRecipeForm({
  recipe,
  saveAction,
}: {
  recipe: Recipe;
  saveAction: (formData: FormData) => Promise<FormErrorKey | null>;
}) {
  const { t } = useLanguage();
  const [errorKey, setErrorKey] = useState<FormErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorKey(null);
    setSaving(true);
    try {
      setErrorKey(await saveAction(formData));
    } catch {
      setErrorKey("error.saveRecipe");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={onSubmit}
      error={errorKey ? t(errorKey) : null}
      isSubmitting={saving}
      submitLabel={saving ? t("form.saving") : t("form.save")}
    />
  );
}
