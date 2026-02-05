import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CookingMode from '@/components/RecipeInstructions';

export default async function CookRecipePage(props: {
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
    notFound();
  }

  return <CookingMode recipe={recipe} />;
}
