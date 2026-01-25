import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function RecipePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  async function deleteRecipe() {
    'use server';
    await prisma.recipe.delete({
      where: {
        id: /^\d+$/.test(id) ? parseInt(id) : id,
      } as any,
    });
    redirect('/');
  }

  const recipe = await prisma.recipe.findUnique({
    where: {
      // Handle both String (UUID) and Int (Auto-increment) IDs
      id: /^\d+$/.test(id) ? parseInt(id) : id,
    } as any,
  });

  if (!recipe) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to recipes
        </Link>
        <div className="flex gap-4">
          <Link
            href={`/recipes/${id}/edit`}
            className="text-indigo-600 hover:text-indigo-800 border border-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition-colors"
          >
            Edit
          </Link>
          <form action={deleteRecipe}>
            <button
              type="submit"
              className="text-red-600 hover:text-red-800 border border-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {recipe.imageUrl && (
        <div className="relative aspect-square w-full max-w-md mx-auto mb-6 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
      
      {recipe.description && (
        <p className="text-gray-600 mb-6 italic">{recipe.description}</p>
      )}
      <div className="flex gap-4 mb-6 text-gray-600">
        {recipe.cookMinutes && (
          <p><strong>Cook Time:</strong> {recipe.cookMinutes} minutes</p>
        )}
        {(recipe as any).category && (
          <p><strong>Category:</strong> {(recipe as any).category}</p>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
          <ul className="list-disc list-inside space-y-1">
            {recipe.ingredients.split('\n').map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.steps.split('\n').map((step, i) => (
              <li key={i} className="pl-2">{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}