export interface CartIngredient {
  name: string;
  checked: boolean;
}

export interface CartItem {
  recipeId: string | number;
  title: string;
  ingredients: CartIngredient[];
}

// Older cart entries store ingredients as strings until the checklist is opened.
export type StoredCartItem = Omit<CartItem, "ingredients"> & {
  ingredients: (string | CartIngredient)[];
};
