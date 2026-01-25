import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const categories = [
  'Breakfast',
  'Soups',
  'Chicken',
  'Pork',
  'Veal',
  'Fish & Seafood',
  'Other Meat',
  'Vegetarian',
  'Cakes',
  'Desserts',
  'Drinks',
  'Sauces',
  'Others',
];

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

    const imageFile = formData.get('image') as File | null;
    let imageUrl = formData.get('existingImageUrl') as string;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadDir = join(process.cwd(), 'public/uploads');

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
      await writeFile(join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const rawCookMinutes = formData.get('cookMinutes') as string;

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      cookMinutes: rawCookMinutes ? parseInt(rawCookMinutes) : null,
      category: formData.get('category') as string,
      ingredients: formData.get('ingredients') as string,
      steps: formData.get('steps') as string,
      imageUrl: imageUrl,
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
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={recipe.title}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            defaultValue={recipe.description || ''}
            rows={3}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cookMinutes"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Cook Time (minutes)
            </label>
            <input
              type="number"
              name="cookMinutes"
              id="cookMinutes"
              defaultValue={recipe.cookMinutes || ''}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Category
            </label>
            <select
              name="category"
              id="category"
              defaultValue={(recipe as any).category || ''}
              className="w-full border rounded p-2 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Image
          </label>
          <input
            type="hidden"
            name="existingImageUrl"
            value={recipe.imageUrl || ''}
          />
          {recipe.imageUrl && (
            <div className="mb-4">
              <img src={recipe.imageUrl} alt="Current recipe" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
        <div>
          <label
            htmlFor="ingredients"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Ingredients (one per line)
          </label>
          <textarea
            name="ingredients"
            id="ingredients"
            defaultValue={recipe.ingredients}
            required
            rows={8}
            className="w-full border rounded p-2 h-32"
          />
        </div>
        <div>
          <label
            htmlFor="steps"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Instructions (one per line)
          </label>
          <textarea
            name="steps"
            id="steps"
            defaultValue={recipe.steps}
            required
            rows={10}
            className="w-full border rounded p-2 h-40"
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
