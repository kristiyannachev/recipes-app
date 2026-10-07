"use client";

import { categories } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryLabel from "./CategoryLabel";

interface CategoryFilterProps {
  selectedCategories: string[];
  onSelectCategories: (categories: string[]) => void;
}

export default function CategoryFilter({
  selectedCategories,
  onSelectCategories,
}: CategoryFilterProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        onClick={() => onSelectCategories([])}
        aria-pressed={selectedCategories.length === 0}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
          selectedCategories.length === 0
            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
            : "bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {t("category.all")}
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() =>
            onSelectCategories(
              selectedCategories.includes(category)
                ? selectedCategories.filter((selected) => selected !== category)
                : [...selectedCategories, category],
            )
          }
          aria-pressed={selectedCategories.includes(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            selectedCategories.includes(category)
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <CategoryLabel category={category} />
        </button>
      ))}
    </div>
  );
}
