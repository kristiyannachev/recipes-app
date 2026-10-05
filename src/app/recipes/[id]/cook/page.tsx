import { notFound } from "next/navigation";
import RecipeSteps from "@/components/RecipeSteps";
import { prisma } from "@/lib/prisma";

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

  return (
    <main className="max-w-3xl mx-auto p-6">
      <RecipeSteps steps={recipe.steps} />
    </main>
  );
}
