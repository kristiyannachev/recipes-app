import type { dictionary } from "@/lib/dictionary";

export const categories = [
  "Breakfast",
  "Salads",
  "Soups",
  "Chicken",
  "Pork",
  "Beef & Veal",
  "Fish & Seafood",
  "Other Meat",
  "Vegetarian",
  "Side Dishes",
  "Bread & Pastries",
  "Cakes",
  "Desserts",
  "Drinks",
  "Sauces",
  "Others",
] as const;

export type Category = (typeof categories)[number];

const categoryEmojis: Record<Category, string> = {
  Breakfast: "🍳",
  Salads: "🥗",
  Soups: "🍲",
  Chicken: "🍗",
  Pork: "🥓",
  "Beef & Veal": "🥩",
  "Fish & Seafood": "🐟",
  "Other Meat": "🍖",
  Vegetarian: "🥦",
  "Side Dishes": "🍚",
  "Bread & Pastries": "🥐",
  Cakes: "🎂",
  Desserts: "🍨",
  Drinks: "🥤",
  Sauces: "🥣",
  Others: "🍽️",
};

export function getCategoryEmoji(category: string): string {
  const knownCategory = categories.find((value) => value === category);
  return knownCategory ? categoryEmojis[knownCategory] : "🏷️";
}

type TranslationKey = keyof typeof dictionary.en;

const categoryTranslationKeys: Record<
  (typeof categories)[number],
  TranslationKey
> = {
  Breakfast: "category.breakfast",
  Salads: "category.salads",
  Soups: "category.soups",
  Chicken: "category.chicken",
  Pork: "category.pork",
  "Beef & Veal": "category.beefAndVeal",
  "Fish & Seafood": "category.fishAndSeafood",
  "Other Meat": "category.otherMeat",
  Vegetarian: "category.vegetarian",
  "Side Dishes": "category.sideDishes",
  "Bread & Pastries": "category.breadAndPastries",
  Cakes: "category.cakes",
  Desserts: "category.desserts",
  Drinks: "category.drinks",
  Sauces: "category.sauces",
  Others: "category.others",
};

export function getCategoryLabel(
  category: string,
  t: (key: TranslationKey) => string,
): string {
  const knownCategory = categories.find((value) => value === category);
  return knownCategory ? t(categoryTranslationKeys[knownCategory]) : category;
}

export function getRecipeCategories(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (category): category is string => typeof category === "string",
      )
    : [];
}

function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    categories.some((category) => category === value)
  );
}

export function parseRecipeCategories(value: unknown): Category[] {
  if (!Array.isArray(value) || !value.every(isCategory)) {
    throw new Error("Categories must be an array of supported category names.");
  }

  return [...new Set(value)];
}
