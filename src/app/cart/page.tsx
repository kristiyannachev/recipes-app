"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShoppingCartRecipe from "@/components/ShoppingCartRecipe";
import type { CartItem, StoredCartItem } from "@/types/shopping-cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart: StoredCartItem[] = JSON.parse(
      localStorage.getItem("shoppingCart") || "[]",
    );
    setCart(
      storedCart.map((item) => ({
        ...item,
        ingredients: item.ingredients.map((ing) =>
          typeof ing === "string" ? { name: ing, checked: false } : ing,
        ),
      })),
    );
  }, []);

  const removeFromCart = (recipeId: string | number) => {
    const newCart = cart.filter((item) => item.recipeId !== recipeId);
    setCart(newCart);
    localStorage.setItem("shoppingCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const toggleIngredient = (recipeId: string | number, index: number) => {
    const newCart = cart.map((item) => {
      if (item.recipeId === recipeId) {
        const newIngredients = [...item.ingredients];
        newIngredients[index] = {
          ...newIngredients[index],
          checked: !newIngredients[index].checked,
        };
        return { ...item, ingredients: newIngredients };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem("shoppingCart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
      localStorage.setItem("shoppingCart", "[]");
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">
          Shopping Cart
        </h1>
        <p className="text-xl text-stone-600 mb-8">Your cart is empty.</p>
        <Link
          href="/"
          className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
        >
          Browse Recipes
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          &larr; Back to recipes
        </Link>
        <h1 className="text-4xl font-extrabold text-emerald-700">
          Shopping Cart
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-8">
        {cart.map((item) => (
          <ShoppingCartRecipe
            key={item.recipeId}
            item={item}
            onRemove={removeFromCart}
            onToggleIngredient={toggleIngredient}
          />
        ))}
      </div>
    </main>
  );
}
