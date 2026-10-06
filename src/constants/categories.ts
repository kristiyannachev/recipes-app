import type { dictionary } from "@/lib/dictionary";

export const categories = [
  "Breakfast",
  "Soups",
  "Chicken",
  "Pork",
  "Veal",
  "Fish & Seafood",
  "Other Meat",
  "Vegetarian",
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
  Soups: "category.soups",
  Chicken: "category.chicken",
  Pork: "category.pork",
  Veal: "category.veal",
  "Fish & Seafood": "category.fishAndSeafood",
  "Other Meat": "category.otherMeat",
  Vegetarian: "category.vegetarian",
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
