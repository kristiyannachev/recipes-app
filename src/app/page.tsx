import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import RecipeList from '@/components/RecipeList';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kris' Recipes</h1>
        <Link
          href="/recipes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          New Recipe
        </Link>
      </div>

      {recipes.length > 0 ? (
        <RecipeList recipes={recipes} />
      ) : (
        <p className="text-gray-500 text-center py-10">
          No recipes yet. Create one to get started!
        </p>
      )}
    </main>
  );
}