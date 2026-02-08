import { prisma } from '@/lib/prisma';
import MainPage from '@/components/MainPage';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <MainPage recipes={recipes} />;
}