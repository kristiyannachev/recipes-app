"use client";

import type { Recipe } from "@prisma/client";
import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryFilter from "./CategoryFilter";

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      selectedCategory === null || recipe.category === selectedCategory;
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="mb-8">
        <input
          type="text"
          placeholder={t("home.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white text-lg"
        />
      </div>

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
