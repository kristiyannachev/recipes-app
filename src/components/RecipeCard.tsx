"use client";

import Link from "next/link";
import CookTime from "@/components/CookTime";
import RecipeCategoryBadges from "@/components/RecipeCategoryBadges";
import RecipeImage from "@/components/RecipeImage";
import { getRecipeCategories } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RecipeListItem } from "@/types/recipe";

export default function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const { t } = useLanguage();
  const categories = getRecipeCategories(recipe.categories);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col border border-stone-200 rounded-2xl hover:border-orange-300 transition-all duration-300 overflow-hidden hover:shadow-xl bg-white group hover:-translate-y-1"
    >
      <div className="relative">
        <RecipeImage
          src={recipe.imageUrl}
          alt={recipe.title}
          imageClassName="group-hover:scale-110 transition-transform duration-700"
          placeholderClassName="text-4xl"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="p-5 bg-orange-400 flex flex-col flex-grow">
        <h2
          className="font-bold text-lg text-white line-clamp-3 break-words group-hover:text-emerald-600 transition-colors"
          title={recipe.title}
        >
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="mt-2 text-sm text-white line-clamp-2 break-words">
            {recipe.description}
          </p>
        )}
        {(recipe.owner || !!recipe.cookMinutes) && (
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white">
            {recipe.owner && (
              <p className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden="true" className="shrink-0">
                  🧑‍🍳
                </span>
                <span className="min-w-0 truncate" title={recipe.owner.name}>
                  {recipe.owner.name}
                </span>
              </p>
            )}
            {!!recipe.cookMinutes && (
              <CookTime
                minutes={recipe.cookMinutes}
                label={t("recipe.minutes")}
                className="ml-auto shrink-0 flex items-center gap-1 text-sm font-medium text-white"
                iconClassName="h-4 w-4 text-white"
              />
            )}
          </div>
        )}
        {categories.length > 0 && (
          <div className="mt-auto pt-3">
            <RecipeCategoryBadges categories={categories} />
          </div>
        )}
      </div>
    </Link>
  );
}
