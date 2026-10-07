"use client";

import CategoryLabel from "./CategoryLabel";

interface RecipeCategoryBadgesProps {
  categories: string[];
  variant?: "card" | "detail";
}

export default function RecipeCategoryBadges({
  categories,
  variant = "card",
}: RecipeCategoryBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className={`flex max-w-full items-center gap-2 px-3 py-1 font-bold text-emerald-700 bg-emerald-50 rounded-full ${variant === "card" ? "text-xs border border-emerald-100" : "text-sm"}`}
        >
          <CategoryLabel
            category={category}
            emojiClassName={variant === "detail" ? "text-lg" : undefined}
          />
        </span>
      ))}
    </div>
  );
}
