"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CartItem } from "@/types/shopping-cart";

interface ShoppingCartRecipeProps {
  item: CartItem;
  onRemove: (recipeId: CartItem["recipeId"]) => void;
  onToggleIngredient: (recipeId: CartItem["recipeId"], index: number) => void;
}

export default function ShoppingCartRecipe({
  item,
  onRemove,
  onToggleIngredient,
}: ShoppingCartRecipeProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-stone-800">
          <Link
            href={`/recipes/${item.recipeId}`}
            className="hover:underline decoration-orange-400 underline-offset-4"
          >
            {item.title}
          </Link>
        </h2>
        <button
          type="button"
          onClick={() => onRemove(item.recipeId)}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
        >
          {t("cart.remove")}
        </button>
      </div>
      <ul className="space-y-3">
        {item.ingredients.map((ingredient, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Ingredients keep their order when toggled and may have duplicate names.
          <li key={index}>
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${ingredient.checked ? "bg-stone-50 border-stone-100" : "bg-white border-stone-200 hover:border-orange-300 hover:shadow-sm"}`}
            >
              <input
                type="checkbox"
                checked={ingredient.checked}
                onChange={() => onToggleIngredient(item.recipeId, index)}
                className="mt-1 h-5 w-5 rounded-md border-stone-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500 shrink-0"
              />
              <span
                className={`text-lg leading-snug ${ingredient.checked ? "line-through text-stone-400" : "text-stone-700"}`}
              >
                {ingredient.name}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
