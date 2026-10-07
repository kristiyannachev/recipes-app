import type { Recipe } from "@prisma/client";

export type RecipeListItem = Recipe & {
  owner: { id: string; name: string } | null;
};
