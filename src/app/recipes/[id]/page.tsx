import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import RecipeDetail from '@/components/RecipeDetail';

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

  return <RecipeDetail recipe={recipe} deleteAction={deleteRecipe} />;
}