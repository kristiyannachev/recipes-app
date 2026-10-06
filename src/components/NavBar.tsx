"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import ShoppingCartIcon from "./ShoppingCartIcon";

export default function NavBar() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav
      aria-label="App controls"
      className="max-w-7xl mx-auto w-full px-6 pt-6 flex items-center justify-end gap-3"
    >
      <div className="bg-white rounded-full shadow-xl border border-stone-100 p-1 flex">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === "en"
              ? "bg-orange-400 text-white"
              : "text-stone-500 hover:bg-stone-100"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("bg")}
          aria-pressed={language === "bg"}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === "bg"
              ? "bg-orange-400 text-white"
              : "text-stone-500 hover:bg-stone-100"
          }`}
        >
          BG
        </button>
      </div>
      <div className="bg-white rounded-full shadow-xl border border-stone-100">
        <ShoppingCartIcon />
      </div>
    </nav>
  );
}
