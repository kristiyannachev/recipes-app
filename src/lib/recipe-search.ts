import { getRecipeCategories } from "../constants/categories";

export const UNASSIGNED_CREATOR = "__unassigned__";
export const cookingTimeFilters = [
  "any",
  "15",
  "30",
  "45",
  "60",
  "120",
  "unknown",
] as const;
export const recipeSorts = [
  "newest",
  "oldest",
  "titleAsc",
  "titleDesc",
  "quickest",
  "longest",
] as const;
export type CookingTimeFilter = (typeof cookingTimeFilters)[number];
export type RecipeSort = (typeof recipeSorts)[number];

export interface RecipeFilters {
  query: string;
  categories: string[];
  categoryMatch: "all" | "any";
  creatorId: string;
  cookingTime: CookingTimeFilter;
  favoritesOnly: boolean;
  sort: RecipeSort;
}

export function defaultRecipeFilters(): RecipeFilters {
  return {
    query: "",
    categories: [],
    categoryMatch: "all",
    creatorId: "",
    cookingTime: "any",
    favoritesOnly: false,
    sort: "newest",
  };
}

interface SearchableRecipe {
  id: string;
  title: string;
  ingredients: string;
  categories: unknown;
  ownerId: string | null;
  cookMinutes: number | null;
  createdAt: Date | string;
}

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase();
}

export function filterAndSortRecipes<T extends SearchableRecipe>(
  recipes: T[],
  filters: RecipeFilters,
  favoriteIds: string[],
  language: string,
): T[] {
  const terms = normalize(filters.query).trim().split(/\s+/).filter(Boolean);
  const favorites = new Set(favoriteIds);
  const collator = new Intl.Collator(language, {
    sensitivity: "base",
    numeric: true,
  });
  const filtered = recipes.filter((recipe) => {
    const text = normalize(`${recipe.title}\n${recipe.ingredients}`);
    if (!terms.every((term) => text.includes(term))) return false;
    const categories = getRecipeCategories(recipe.categories);
    if (
      filters.categories.length &&
      !(filters.categoryMatch === "all"
        ? filters.categories.every((category) => categories.includes(category))
        : filters.categories.some((category) => categories.includes(category)))
    )
      return false;
    if (
      filters.creatorId === UNASSIGNED_CREATOR
        ? recipe.ownerId !== null
        : filters.creatorId && recipe.ownerId !== filters.creatorId
    )
      return false;
    if (filters.cookingTime === "unknown" && recipe.cookMinutes !== null)
      return false;
    if (
      filters.cookingTime !== "any" &&
      filters.cookingTime !== "unknown" &&
      (recipe.cookMinutes === null ||
        recipe.cookMinutes > Number(filters.cookingTime))
    )
      return false;
    return !filters.favoritesOnly || favorites.has(recipe.id);
  });

  return filtered.sort((a, b) => {
    const dateDifference =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    const tie = () => dateDifference || a.id.localeCompare(b.id);
    switch (filters.sort) {
      case "oldest":
        return -dateDifference || a.id.localeCompare(b.id);
      case "titleAsc":
        return collator.compare(a.title, b.title) || tie();
      case "titleDesc":
        return collator.compare(b.title, a.title) || tie();
      case "quickest":
      case "longest": {
        // Missing durations stay last for both directions.
        if (a.cookMinutes === null) return b.cookMinutes === null ? tie() : 1;
        if (b.cookMinutes === null) return -1;
        return (
          (filters.sort === "quickest"
            ? a.cookMinutes - b.cookMinutes
            : b.cookMinutes - a.cookMinutes) || tie()
        );
      }
      default:
        return tie();
    }
  });
}
