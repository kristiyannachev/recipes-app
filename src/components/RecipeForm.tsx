"use client";

import type { Recipe } from "@prisma/client";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEventHandler,
  useEffect,
  useRef,
} from "react";
import FormField, { formControlClassName } from "@/components/FormField";
import ImageUploadPreview from "@/components/ImageUploadPreview";
import RecipeCategoryPicker from "@/components/RecipeCategoryPicker";
import { getRecipeCategories } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { getValidationKey } from "@/lib/form-validation";

interface RecipeFormOptions {
  recipe?: Recipe;
  error?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
}

type RecipeFormProps = RecipeFormOptions &
  (
    | { action: (formData: FormData) => void | Promise<void>; onSubmit?: never }
    | { action?: never; onSubmit: FormEventHandler<HTMLFormElement> }
  );

export default function RecipeForm({
  recipe,
  action,
  onSubmit,
  error,
  isSubmitting = false,
  submitLabel,
  onImageChange,
  uploading,
}: RecipeFormProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!recipe;

  useEffect(() => {
    const fields = formRef.current?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea");
    for (const field of fields ?? []) {
      if (!field.validity.customError) continue;
      field.setCustomValidity("");
      if (!field.validity.valid)
        field.setCustomValidity(
          t(getValidationKey(field.validity, field.name)),
        );
    }
  }, [t]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={isEdit ? `/recipes/${recipe.id}` : "/"}
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          &larr; {t("recipe.back")}
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">
        {isEdit
          ? t("form.editTitle").replace("{title}", recipe.title)
          : t("form.newTitle")}
      </h1>
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100"
        >
          {error}
        </div>
      )}
      <form
        ref={formRef}
        action={action}
        onSubmit={onSubmit}
        onInvalidCapture={(event) => {
          const field = event.target;
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
          ) {
            field.setCustomValidity("");
            field.setCustomValidity(
              t(getValidationKey(field.validity, field.name)),
            );
          }
        }}
        onInputCapture={(event) => {
          const field = event.target;
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
          )
            field.setCustomValidity("");
        }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <FormField label={t("form.title")} htmlFor="recipe-title">
              <input
                type="text"
                id="recipe-title"
                name="title"
                defaultValue={recipe?.title}
                required
                maxLength={50}
                className={formControlClassName}
              />
            </FormField>
            <FormField
              label={t("form.description")}
              htmlFor="recipe-description"
            >
              <textarea
                id="recipe-description"
                name="description"
                defaultValue={recipe?.description || ""}
                rows={3}
                maxLength={50}
                className={formControlClassName}
              />
            </FormField>
            <FormField label={t("form.sourceUrl")} htmlFor="recipe-sourceUrl">
              <input
                type="url"
                id="recipe-sourceUrl"
                name="sourceUrl"
                defaultValue={recipe?.sourceUrl || ""}
                className={formControlClassName}
              />
            </FormField>
            <div className="md:w-1/2">
              <FormField
                label={t("form.cookTime")}
                htmlFor="recipe-cookMinutes"
              >
                <input
                  type="number"
                  id="recipe-cookMinutes"
                  name="cookMinutes"
                  defaultValue={recipe?.cookMinutes || ""}
                  min="1"
                  className={formControlClassName}
                />
              </FormField>
            </div>
            <RecipeCategoryPicker
              defaultSelected={getRecipeCategories(recipe?.categories)}
            />
            <FormField
              label={t("form.ingredients")}
              htmlFor="recipe-ingredients"
            >
              <textarea
                id="recipe-ingredients"
                name="ingredients"
                defaultValue={recipe?.ingredients}
                required
                rows={8}
                className={`${formControlClassName} h-32`}
              />
            </FormField>
            <FormField label={t("form.steps")} htmlFor="recipe-steps">
              <textarea
                id="recipe-steps"
                name="steps"
                defaultValue={recipe?.steps}
                required
                rows={10}
                className={`${formControlClassName} h-40`}
              />
            </FormField>
          </div>

          <div>
            <ImageUploadPreview
              initialImageUrl={recipe?.imageUrl}
              onImageChange={onImageChange}
              uploading={uploading}
            />
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100 mt-8 flex justify-end gap-4">
          <Link
            href={isEdit ? `/recipes/${recipe.id}` : "/"}
            className="px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-stone-200 transition-all"
          >
            {t("recipe.cancel")}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitLabel ?? (isEdit ? t("form.save") : t("form.create"))}
          </button>
        </div>
      </form>
    </main>
  );
}
