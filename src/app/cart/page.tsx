'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItem {
  recipeId: string | number;
  title: string;
  ingredients: { name: string; checked: boolean }[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    setCart(storedCart.map((item: any) => ({
      ...item,
      ingredients: item.ingredients.map((ing: any) => 
        typeof ing === 'string' ? { name: ing, checked: false } : ing
      )
    })));
  }, []);

  const removeFromCart = (recipeId: string | number) => {
    const newCart = cart.filter((item) => item.recipeId !== recipeId);
    setCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const toggleIngredient = (recipeId: string | number, index: number) => {
    const newCart = cart.map((item) => {
      if (item.recipeId === recipeId) {
        const newIngredients = [...item.ingredients];
        newIngredients[index] = { ...newIngredients[index], checked: !newIngredients[index].checked };
        return { ...item, ingredients: newIngredients };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      localStorage.setItem('shoppingCart', '[]');
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">Shopping Cart</h1>
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
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-emerald-700">Shopping Cart</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
          >
            Clear Cart
          </button>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            &larr; Back to recipes
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {cart.map((item) => (
          <div key={item.recipeId} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-stone-800">
                <Link href={`/recipes/${item.recipeId}`} className="hover:underline decoration-orange-400 underline-offset-4">
                  {item.title}
                </Link>
              </h2>
              <button
                onClick={() => removeFromCart(item.recipeId)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
            <ul className="space-y-3">
              {item.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      ingredient.checked
                        ? 'bg-stone-50 border-stone-100'
                        : 'bg-white border-stone-200 hover:border-orange-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={ingredient.checked}
                      onChange={() => toggleIngredient(item.recipeId, index)}
                      className="mt-1 h-5 w-5 rounded-md border-stone-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500 shrink-0"
                    />
                    <span
                      className={`text-lg leading-snug ${
                        ingredient.checked ? 'line-through text-stone-400' : 'text-stone-700'
                      }`}
                    >
                      {ingredient.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
