"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ShoppingCartIcon() {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
      setCount(cart.length);
    };

    updateCount();

    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative p-2 text-stone-600 hover:text-emerald-700 rounded-full transition-all duration-200"
      aria-label={t("cart.title")}
    >
      <span className="text-2xl">🛒</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white">
          {count}
        </span>
      )}
    </Link>
  );
}
