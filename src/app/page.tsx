import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import RecipeList from '@/components/RecipeList';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-emerald-700 tracking-tight">Kris' Recipes</h1>
        <Link
          href="/recipes/new"
          className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
        >
          + New Recipe
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