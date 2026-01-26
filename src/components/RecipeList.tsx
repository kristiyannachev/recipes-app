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
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-stone-200 rounded-2xl shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white text-lg"
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
            className="flex flex-col border border-stone-200 rounded-2xl hover:border-orange-300 transition-all duration-300 overflow-hidden hover:shadow-xl bg-white group hover:-translate-y-1"
          >
            <div className="aspect-square w-full relative bg-stone-100 overflow-hidden">
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">
                  🍽️
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div className="p-5 bg-white flex flex-col flex-grow">
              <h2 className="font-bold text-lg text-stone-800 truncate group-hover:text-orange-600 transition-colors" title={recipe.title}>
                {recipe.title}
              </h2>
              <div className="flex-grow mt-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-stone-500 line-clamp-2 pr-2">
                    {recipe.description || ''}
                  </p>
                  {recipe.cookMinutes && (
                    <div className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-stone-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{recipe.cookMinutes} min</span>
                    </div>
                  )}
                </div>
              </div>
              {recipe.category && (
                <div className="mt-auto pt-3">
                  <span className="inline-block px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                    {recipe.category}
                  </span>
                </div>
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