import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { canDeleteRecipe, canEditRecipe } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function RecipePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  async function deleteRecipe() {
    "use server";
    if (!canDeleteRecipe(await getCurrentUser())) throw new Error("Forbidden");
    await prisma.recipe.delete({
      where: { id },
    });
    revalidatePath("/");
    redirect("/");
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });

  if (!recipe) {
    notFound();
  }

  const user = await getCurrentUser();
  const preference = user
    ? await prisma.recipePreference.findUnique({
        where: { userId_recipeId: { userId: user.id, recipeId: id } },
      })
    : null;
  return (
    <RecipeDetail
      recipe={recipe}
      deleteAction={deleteRecipe}
      canEdit={canEditRecipe(user, recipe.ownerId)}
      canDelete={canDeleteRecipe(user)}
      ownerName={recipe.owner?.name ?? null}
      personalUserId={user?.id ?? null}
      preference={
        preference
          ? { isFavorite: preference.isFavorite, note: preference.note }
          : null
      }
    />
  );
}
