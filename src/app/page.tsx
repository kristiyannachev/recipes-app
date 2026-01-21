import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link
          href="/recipes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          New Recipe
        </Link>
      </div>

      <div className="grid gap-4">
        {recipes.map((recipe) => (
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
        {recipes.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No recipes yet. Create one to get started!
          </p>
        )}
      </div>
    </main>
  );
}