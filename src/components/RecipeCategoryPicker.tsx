"use client";

import { categories } from "@/constants/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryLabel from "./CategoryLabel";

export default function RecipeCategoryPicker({
  defaultSelected = [],
}: {
  defaultSelected?: string[];
}) {
  const { t } = useLanguage();

  return (
    <fieldset>
      <legend className="text-sm font-bold text-emerald-700 mb-2">
        {t("form.categories")}
      </legend>
      <p className="text-sm text-stone-500 mb-3">{t("form.categoriesHint")}</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <label key={category} className="cursor-pointer">
            <input
              type="checkbox"
              name="categories"
              value={category}
              defaultChecked={defaultSelected.includes(category)}
              className="peer sr-only"
            />
            <span className="block px-4 py-2 rounded-full text-sm font-medium border border-stone-200 bg-white text-stone-600 transition-colors hover:border-emerald-400 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-2">
              <CategoryLabel category={category} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
