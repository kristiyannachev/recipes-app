"use client";

import type { Recipe } from "@prisma/client";
import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { getRecipeCategories } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import CategoryFilter from "./CategoryFilter";

interface RecipeListProps {
  recipes: Recipe[];
  favoriteIds: string[];
}

export default function RecipeList({ recipes, favoriteIds }: RecipeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const user = useUser();
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      selectedCategory === null ||
      getRecipeCategories(recipe.categories).includes(selectedCategory);
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return (
      matchesCategory &&
      matchesSearch &&
      (!user || !favoritesOnly || favoriteIds.includes(recipe.id))
    );
  });

  return (
    <>
      <div className="mb-8">
        <input
          type="text"
          placeholder={t("home.searchPlaceholder")}
          aria-label={t("home.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white text-lg"
        />
      </div>

      {user && (
        <label className="flex items-center gap-2 mb-5 text-emerald-700 font-bold">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          {t("personal.onlyFavorites")}
        </label>
      )}

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {filteredRecipes.length === 0 && (
          <p className="text-emerald-700 text-center py-10">
            {t("home.noSearchResults")}
          </p>
        )}
      </div>
    </>
  );
}
