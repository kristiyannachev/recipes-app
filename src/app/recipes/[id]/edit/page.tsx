import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function EditRecipePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: /^\d+$/.test(id) ? parseInt(id) : id,
    } as any,
  });

  if (!recipe) {
    redirect('/');
  }

  async function updateRecipe(formData: FormData) {
    'use server';

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      ingredients: formData.get('ingredients') as string,
      steps: formData.get('steps') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    await prisma.recipe.update({
      where: {
        id: /^\d+$/.test(id) ? parseInt(id) : id,
      } as any,
      data,
    });

    revalidatePath(`/recipes/${id}`);
    revalidatePath('/');
    redirect(`/recipes/${id}`);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link href={`/recipes/${id}`} className="text-blue-600 hover:underline">
          &larr; Back to recipe
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit "{recipe.title}"</h1>
      <form
        action={updateRecipe}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-m font-bold mb-1"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={recipe.title}
            required
            className="mt-1 block w-full rounded-md border border-white bg-transparent shadow-sm focus:border-white focus:ring-indigo-500 sm:text-sm text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-m font-bold mb-1"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            defaultValue={recipe.description || ''}
            rows={3}
            className="mt-1 block w-full rounded-md border border-white bg-transparent shadow-sm focus:border-white focus:ring-indigo-500 sm:text-sm text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-m font-bold mb-1"
          >
            Image URL
          </label>
          <input
            type="url"
            name="imageUrl"
            id="imageUrl"
            defaultValue={recipe.imageUrl || ''}
            className="mt-1 block w-full rounded-md border border-white bg-transparent shadow-sm focus:border-white focus:ring-indigo-500 sm:text-sm text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="ingredients"
            className="block text-m font-bold mb-1"
          >
            Ingredients (one per line)
          </label>
          <textarea
            name="ingredients"
            id="ingredients"
            defaultValue={recipe.ingredients}
            required
            rows={8}
            className="mt-1 block w-full rounded-md border border-white bg-transparent shadow-sm focus:border-white focus:ring-indigo-500 sm:text-sm text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="steps"
            className="block text-m font-bold mb-1"
          >
            Instructions (one per line)
          </label>
          <textarea
            name="steps"
            id="steps"
            defaultValue={recipe.steps}
            required
            rows={10}
            className="mt-1 block w-full rounded-md border border-white bg-transparent shadow-sm focus:border-white focus:ring-indigo-500 sm:text-sm text-gray-400"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Link
            href={`/recipes/${id}`}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
