"use client";

import type { Recipe } from "@prisma/client";
import Link from "next/link";
import CookTime from "@/components/CookTime";
import RecipeCategoryBadges from "@/components/RecipeCategoryBadges";
import RecipeImage from "@/components/RecipeImage";
import { getRecipeCategories } from "@/constants/categories";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
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
          className="font-bold text-lg text-white truncate group-hover:text-emerald-600 transition-colors"
          title={recipe.title}
        >
          {recipe.title}
        </h2>
        <div className="flex-grow mt-2">
          <div className="flex justify-between items-start">
            <p className="text-sm text-white line-clamp-2 pr-2">
              {recipe.description || ""}
            </p>
            {!!recipe.cookMinutes && (
              <CookTime
                minutes={recipe.cookMinutes}
                label="min"
                className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-white"
                iconClassName="h-4 w-4 text-white"
              />
            )}
          </div>
        </div>
        {categories.length > 0 && (
          <div className="mt-auto pt-3">
            <RecipeCategoryBadges categories={categories} />
          </div>
        )}
      </div>
    </Link>
  );
}
