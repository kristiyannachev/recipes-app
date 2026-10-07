"use client";

import { getCategoryEmoji, getCategoryLabel } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CategoryLabel({
  category,
  emojiClassName,
}: {
  category: string;
  emojiClassName?: string;
}) {
  const { t } = useLanguage();
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className={`shrink-0 ${emojiClassName ?? ""}`}>
        {getCategoryEmoji(category)}
      </span>
      <span className="min-w-0 break-words">
        {getCategoryLabel(category, t)}
      </span>
    </span>
  );
}
