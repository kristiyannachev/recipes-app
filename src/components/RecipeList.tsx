'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Recipe } from '@prisma/client';
import CategoryFilter from './CategoryFilter';

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === null || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="flex flex-col border rounded-lg hover:border-blue-500 transition overflow-hidden hover:shadow-md bg-white"
          >
            <div className="aspect-square w-full relative bg-gray-100">
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                  🍽️
                </div>
              )}
            </div>
            <div className="p-3">
              <h2 className="font-semibold text-gray-900 truncate" title={recipe.title}>
                {recipe.title}
              </h2>
              {recipe.category && (
                <p className="text-xs text-gray-500 mt-1">{recipe.category}</p>
              )}
            </div>
          </Link>
        ))}
        {filteredRecipes.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No recipes found.
          </p>
        )}
      </div>
    </>
  );
}