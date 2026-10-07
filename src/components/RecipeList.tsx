"use client";

import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import RecipeFilters from "@/components/RecipeFilters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import {
  defaultRecipeFilters,
  filterAndSortRecipes,
} from "@/lib/recipe-search";
import type { RecipeListItem } from "@/types/recipe";

interface RecipeListProps {
  recipes: RecipeListItem[];
  favoriteIds: string[];
}

export default function RecipeList({ recipes, favoriteIds }: RecipeListProps) {
  const [filters, setFilters] = useState(defaultRecipeFilters);
  const { t, language } = useLanguage();
  const user = useUser();
  const filteredRecipes = filterAndSortRecipes(
    recipes,
    { ...filters, favoritesOnly: !!user && filters.favoritesOnly },
    favoriteIds,
    language,
  );

  return (
    <>
      <RecipeFilters
        recipes={recipes}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultRecipeFilters())}
        resultCount={filteredRecipes.length}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {filteredRecipes.length === 0 && (
          <p className="col-span-full text-emerald-700 text-center py-10">
            {t("home.noSearchResults")}
          </p>
        )}
      </div>
    </>
  );
}
