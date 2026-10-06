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
