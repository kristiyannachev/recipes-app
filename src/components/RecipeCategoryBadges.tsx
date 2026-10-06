"use client";

import { getCategoryLabel } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecipeCategoryBadgesProps {
  categories: string[];
  variant?: "card" | "detail";
}

export default function RecipeCategoryBadges({
  categories,
  variant = "card",
}: RecipeCategoryBadgesProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className={`flex items-center gap-2 px-3 py-1 font-bold text-emerald-700 bg-emerald-50 rounded-full ${variant === "card" ? "text-xs border border-emerald-100" : "text-sm"}`}
        >
          {variant === "detail" && (
            <span className="text-lg" aria-hidden="true">
              🏷️
            </span>
          )}
          {getCategoryLabel(category, t)}
        </span>
      ))}
    </div>
  );
}
