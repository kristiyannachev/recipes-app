import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import EditRecipeForm from "@/components/EditRecipeForm";
import { type Category, parseRecipeCategories } from "@/constants/categories";
import type { FormErrorKey } from "@/lib/form-errors";
import { canEditRecipe } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { saveRecipeImage } from "@/lib/upload";

export default async function EditRecipePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const user = await getCurrentUser();
  if (!user)
    redirect(`/sign-in?next=${encodeURIComponent(`/recipes/${id}/edit`)}`);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  if (!recipe) {
    redirect("/");
  }
  if (!canEditRecipe(user, recipe.ownerId)) notFound();

  async function updateRecipe(
    formData: FormData,
  ): Promise<FormErrorKey | null> {
    "use server";
    const currentUser = await getCurrentUser();
    if (!currentUser) return "error.signInRequired";
    const currentRecipe = await prisma.recipe.findUnique({ where: { id } });
    if (!currentRecipe || !canEditRecipe(currentUser, currentRecipe.ownerId))
      return "error.forbidden";

    let categories: Category[];
    try {
      categories = parseRecipeCategories(formData.getAll("categories"));
    } catch {
      return "error.invalidCategories";
    }

    const title = String(formData.get("title") ?? "");
    const ingredients = String(formData.get("ingredients") ?? "");
    const steps = String(formData.get("steps") ?? "");
    if (!title.trim() || !ingredients.trim() || !steps.trim())
      return "error.recipeRequiredFields";

    const imageFile = formData.get("image") as File | null;
    let imageUrl = formData.get("existingImageUrl") as string;

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveRecipeImage(imageFile);
      } catch (error) {
        console.error("Error updating recipe image:", error);
        return "error.uploadImage";
      }
    }

    const rawCookMinutes = formData.get("cookMinutes") as string;
    const sourceUrl = formData.get("sourceUrl") as string;

    const data = {
      title,
      description: formData.get("description") as string,
      cookMinutes: rawCookMinutes ? parseInt(rawCookMinutes, 10) : null,
      categories,
      ingredients,
      steps,
      imageUrl: imageUrl,
      sourceUrl: sourceUrl || null,
    };

    try {
      await prisma.recipe.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("Error saving recipe:", error);
      return "error.saveRecipe";
    }

    revalidatePath(`/recipes/${id}`);
    revalidatePath("/");
    redirect(`/recipes/${id}`);
  }

  return <EditRecipeForm recipe={recipe} saveAction={updateRecipe} />;
}
