"use client";

import Link from "next/link";
import RecipeList from "@/components/RecipeList";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RecipeListItem } from "@/types/recipe";

export default function MainPage({
  recipes,
  favoriteIds,
}: {
  recipes: RecipeListItem[];
  favoriteIds: string[];
}) {
  const { t } = useLanguage();

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-emerald-700 tracking-tight">
          {t("app.title")}
        </h1>
        <Link
          href="/recipes/new"
          className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
        >
          {t("nav.newRecipe")}
        </Link>
      </div>

      {recipes.length > 0 ? (
        <RecipeList recipes={recipes} favoriteIds={favoriteIds} />
      ) : (
        <p className="text-gray-500 text-center py-10">{t("home.noRecipes")}</p>
      )}
    </main>
  );
}
