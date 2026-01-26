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

      <div className="grid gap-4">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="flex justify-between items-start p-4 border rounded hover:border-blue-500 transition"
          >
            <div>
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              {recipe.description && (
                <p className="text-gray-600 mt-1">{recipe.description}</p>
              )}
            </div>
            {recipe.imageUrl && (
              <div className="relative w-24 h-24 ml-4 flex-shrink-0 overflow-hidden rounded">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
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