import MainPage from "@/components/MainPage";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  const user = await getCurrentUser();
  const favorites = user
    ? await prisma.recipePreference.findMany({
        where: { userId: user.id, isFavorite: true },
        select: { recipeId: true },
      })
    : [];
  return (
    <MainPage
      recipes={recipes}
      favoriteIds={favorites.map((item) => item.recipeId)}
    />
  );
}
