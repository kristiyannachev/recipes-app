import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import RecipeInstructions from '@/components/RecipeInstructions';
import AddToShoppingCartButton from '@/components/AddToShoppingCartButton';

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
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to recipes
        </Link>
        <div className="flex gap-4">
          <Link
            href={`/recipes/${id}/edit`}
            className="text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-stone-100 px-4 py-2 rounded-full transition-colors font-medium"
          >
            Edit
          </Link>
          <DeleteRecipeButton deleteAction={deleteRecipe} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold text-emerald-700 mb-8 tracking-tight break-words">{recipe.title}</h1>
            
            {recipe.description && (
              <p className="text-xl text-emerald-600 mb-6 leading-relaxed break-words">{recipe.description}</p>
            )}

            {(recipe as any).sourceUrl && (
              <div className="mb-6">
                <a
                  href={(recipe as any).sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition-colors"
                >
                  View Original Recipe Source &rarr;
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm font-bold text-stone-500 uppercase tracking-wider">
              {recipe.cookMinutes && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-500 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.cookMinutes} MIN COOK TIME
                </div>
              )}
              {(recipe as any).category && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                   <span className="text-lg">🏷️</span>
                   {(recipe as any).category}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-stone-200 my-8"></div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                  <span className="text-orange-500">🍱</span> Ingredients
                </h2>
                <AddToShoppingCartButton
                  recipeId={recipe.id}
                  title={recipe.title}
                  ingredients={recipe.ingredients}
                />
              </div>
              <ul className="space-y-3 text-lg text-stone-700">
                {recipe.ingredients.split('\n').map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 block h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </section>

            <RecipeInstructions steps={recipe.steps} />
          </div>
        </div>

        {/* Right Column: Image */}
        <div>
           <div className="sticky top-8">
            {recipe.imageUrl ? (
                <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-stone-100">
                <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="object-cover w-full h-full"
                />
                </div>
            ) : (
                <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-stone-100 flex items-center justify-center text-stone-300 text-6xl">
                    🍽️
                </div>
            )}
           </div>
        </div>
      </div>
    </main>
  );
}