"use client";

import type { Recipe } from "@prisma/client";
import Link from "next/link";
import CookTime from "@/components/CookTime";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import RecipeImage from "@/components/RecipeImage";
import RecipeIngredients from "@/components/RecipeIngredients";
import RecipeSteps from "@/components/RecipeSteps";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecipeDetailProps {
  recipe: Recipe;
  deleteAction: () => Promise<void>;
}

export default function RecipeDetail({
  recipe,
  deleteAction,
}: RecipeDetailProps) {
  const { t } = useLanguage();

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <Link
          href="/"
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          &larr; {t("recipe.back")}
        </Link>
        <div className="flex gap-4">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="bg-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow"
          >
            {t("recipe.edit")}
          </Link>
          <DeleteRecipeButton deleteAction={deleteAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold text-emerald-700 mb-8 tracking-tight break-words">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="text-xl text-emerald-600 mb-6 leading-relaxed break-words">
                {recipe.description}
              </p>
            )}

            {recipe.sourceUrl && (
              <div className="mb-6">
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition-colors"
                >
                  {t("recipe.source")} &rarr;
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
              {!!recipe.cookMinutes && (
                <CookTime
                  minutes={recipe.cookMinutes}
                  label={t("recipe.cookTime")}
                  className="flex items-center gap-2 bg-orange-50 text-orange-500 px-3 py-1 rounded-full"
                  iconClassName="h-5 w-5"
                />
              )}
              {recipe.category && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                  <span className="text-lg">🏷️</span>
                  {recipe.category}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-stone-200 my-8"></div>

          <div className="space-y-8">
            <RecipeIngredients
              id={recipe.id}
              title={recipe.title}
              ingredients={recipe.ingredients}
            />

            <RecipeSteps steps={recipe.steps} />
          </div>
        </div>

        {/* Right Column: Image */}
        <div>
          <div className="sticky top-8">
            <RecipeImage
              src={recipe.imageUrl}
              alt={recipe.title}
              className="rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
