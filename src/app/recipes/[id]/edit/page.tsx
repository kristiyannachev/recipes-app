import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { join } from "path";
import EditRecipeForm from "@/components/EditRecipeForm";
import { type Category, parseRecipeCategories } from "@/constants/categories";
import type { FormErrorKey } from "@/lib/form-errors";
import { prisma } from "@/lib/prisma";

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
    redirect("/");
  }

  async function updateRecipe(
    formData: FormData,
  ): Promise<FormErrorKey | null> {
    "use server";

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
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadDir = join(process.cwd(), "public/uploads");

        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;
        await writeFile(join(uploadDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
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
      cookMinutes: rawCookMinutes ? parseInt(rawCookMinutes) : null,
      categories,
      ingredients,
      steps,
      imageUrl: imageUrl,
      sourceUrl: sourceUrl || null,
    };

    try {
      await prisma.recipe.update({
        where: {
          id: /^\d+$/.test(id) ? parseInt(id) : id,
        } as any,
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
