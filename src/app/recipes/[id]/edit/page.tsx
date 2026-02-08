import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import RecipeForm from '@/components/RecipeForm';

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

  return <RecipeForm recipe={recipe} action={updateRecipe} />;
}
