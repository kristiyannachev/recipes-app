
'use client';

import { useState, useEffect } from 'react';

interface AddToShoppingCartButtonProps {
  recipeId: string | number;
  title: string;
  ingredients: string;
}

export default function AddToShoppingCartButton({
  recipeId,
  title,
  ingredients,
}: AddToShoppingCartButtonProps) {
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    const exists = cart.some((item: any) => item.recipeId === recipeId);
    setIsInCart(exists);
  }, [recipeId]);

  const toggleCart = () => {
    const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');

    if (isInCart) {
      const newCart = cart.filter((item: any) => item.recipeId !== recipeId);
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      setIsInCart(false);
    } else {
      cart.push({
        recipeId,
        title,
        ingredients: ingredients.split('\n').filter((i) => i.trim()),
      });
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      setIsInCart(true);
    }

    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      onClick={toggleCart}
      className={`px-4 py-2 rounded-full transition-colors font-medium border flex items-center gap-2 ${
        isInCart
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
          : 'text-stone-600 hover:text-stone-900 border-stone-300 hover:bg-stone-100 bg-white'
      }`}
    >
      <span>{isInCart ? '✓' : '🛒'}</span>
      {isInCart ? 'In Cart' : 'Add to Cart'}
    </button>
  );
}
