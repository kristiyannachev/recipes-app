"use client";

import type { Recipe } from "@prisma/client";
import AddToShoppingCartButton from "@/components/AddToShoppingCartButton";
import { useLanguage } from "@/contexts/LanguageContext";

type RecipeIngredientsProps = Pick<Recipe, "id" | "title" | "ingredients">;

export default function RecipeIngredients({
  id,
  title,
  ingredients,
}: RecipeIngredientsProps) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-orange-500">🍱</span> {t("recipe.ingredients")}
        </h2>
        <AddToShoppingCartButton
          recipeId={id}
          title={title}
          ingredients={ingredients}
        />
      </div>
      <ul className="space-y-3 text-lg text-stone-700">
        {ingredients.split("\n").map((ingredient, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: The ordered recipe lines are read-only and may contain duplicates.
          <li key={index} className="flex items-start gap-3">
            <span className="mt-2 block h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
            <span>{ingredient}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
