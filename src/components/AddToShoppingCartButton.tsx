
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

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
      className={`px-4 py-2 rounded-full transition-colors font-medium flex items-center gap-2 ${
        isInCart
          ? 'bg-emerald-100 text-emerald-700 py-3 border-emerald-200 hover:bg-emerald-200'
          : 'bg-orange-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition shadow-sm hover:shadow'
      }`}
    >
      <span>{isInCart ? '✓' : '🛒'}</span>
      {isInCart ? t('cart.inCart') : t('cart.addToCart')}
    </button>
  );
}
