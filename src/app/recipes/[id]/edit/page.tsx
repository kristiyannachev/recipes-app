import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { categories } from '@/constants/categories';

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
    const sourceUrl = formData.get('sourceUrl') as string;

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      cookMinutes: rawCookMinutes ? parseInt(rawCookMinutes) : null,
      category: formData.get('category') as string,
      ingredients: formData.get('ingredients') as string,
      steps: formData.get('steps') as string,
      imageUrl: imageUrl,
      sourceUrl: sourceUrl || null,
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
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/recipes/${id}`}
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          &larr; Back to recipe
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">
        Edit "{recipe.title}"
      </h1>
      <form
        action={updateRecipe}
        className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                defaultValue={recipe.title}
                required
                maxLength={50}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={recipe.description || ''}
                rows={3}
                maxLength={50}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Source URL
              </label>
              <input
                type="url"
                name="sourceUrl"
                defaultValue={(recipe as any).sourceUrl || ''}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  name="cookMinutes"
                  defaultValue={recipe.cookMinutes || ''}
                  min="1"
                  className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={(recipe as any).category || ''}
                  className="w-full border border-stone-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Ingredients (one per line)
              </label>
              <textarea
                name="ingredients"
                defaultValue={recipe.ingredients}
                required
                rows={8}
                className="w-full border border-stone-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Steps
              </label>
              <textarea
                name="steps"
                defaultValue={recipe.steps}
                required
                rows={10}
                className="w-full border border-stone-200 rounded-xl p-3 h-40 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg:white"
              />
            </div>
          </div>

          <div>
            <div className="sticky top-8">
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Image
              </label>
              <input
                type="hidden"
                name="existingImageUrl"
                value={recipe.imageUrl || ''}
              />
              <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-stone-100 mb-6">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt="Current recipe"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">
                    🍽️
                  </div>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100 mt-8 flex justify-end gap-4">
          <Link
            href={`/recipes/${id}`}
            className="px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-stone-200 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
