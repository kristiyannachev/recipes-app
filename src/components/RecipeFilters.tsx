"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import {
  cookingTimeFilters,
  type RecipeFilters as Filters,
  recipeSorts,
  UNASSIGNED_CREATOR,
} from "@/lib/recipe-search";
import type { RecipeListItem } from "@/types/recipe";
import CategoryFilter from "./CategoryFilter";
import FormField, { formControlClassName } from "./FormField";

export default function RecipeFilters({
  recipes,
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  recipes: RecipeListItem[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}) {
  const { t, language } = useLanguage();
  const user = useUser();
  const creators = [
    ...new Map(
      recipes.flatMap((recipe) =>
        recipe.owner ? [[recipe.owner.id, recipe.owner] as const] : [],
      ),
    ).values(),
  ].sort(
    (a, b) =>
      a.name.localeCompare(b.name, language, {
        sensitivity: "base",
        numeric: true,
      }) || a.id.localeCompare(b.id),
  );

  return (
    <section aria-label={t("filters.controls")} className="mb-6 space-y-5">
      <input
        type="search"
        placeholder={t("home.searchPlaceholder")}
        aria-label={t("home.searchPlaceholder")}
        value={filters.query}
        onChange={(event) =>
          onChange({ ...filters, query: event.target.value })
        }
        className="w-full p-4 border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white text-lg"
      />

      <CategoryFilter
        selectedCategories={filters.categories}
        onSelectCategories={(categories) =>
          onChange({ ...filters, categories })
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label={t("filters.categoryMatch")} htmlFor="category-match">
          <select
            id="category-match"
            className={formControlClassName}
            value={filters.categoryMatch}
            onChange={(event) =>
              onChange({
                ...filters,
                categoryMatch: event.target.value as Filters["categoryMatch"],
              })
            }
          >
            <option value="all">{t("filters.matchAll")}</option>
            <option value="any">{t("filters.matchAny")}</option>
          </select>
        </FormField>
        <FormField label={t("filters.creator")} htmlFor="recipe-creator">
          <select
            id="recipe-creator"
            className={formControlClassName}
            value={filters.creatorId}
            onChange={(event) =>
              onChange({ ...filters, creatorId: event.target.value })
            }
          >
            <option value="">{t("filters.allCreators")}</option>
            {creators.map((creator) => (
              <option value={creator.id} key={creator.id}>
                {creator.name}
              </option>
            ))}
            {recipes.some((recipe) => recipe.ownerId === null) && (
              <option value={UNASSIGNED_CREATOR}>
                {t("filters.noCreator")}
              </option>
            )}
          </select>
        </FormField>
        <FormField label={t("filters.cookingTime")} htmlFor="recipe-time">
          <select
            id="recipe-time"
            className={formControlClassName}
            value={filters.cookingTime}
            onChange={(event) =>
              onChange({
                ...filters,
                cookingTime: event.target.value as Filters["cookingTime"],
              })
            }
          >
            {cookingTimeFilters.map((time) => (
              <option key={time} value={time}>
                {time === "any"
                  ? t("filters.anyTime")
                  : time === "unknown"
                    ? t("filters.unknownTime")
                    : t("filters.upToMinutes").replace("{minutes}", time)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("filters.sort")} htmlFor="recipe-sort">
          <select
            id="recipe-sort"
            className={formControlClassName}
            value={filters.sort}
            onChange={(event) =>
              onChange({
                ...filters,
                sort: event.target.value as Filters["sort"],
              })
            }
          >
            {recipeSorts.map((sort) => (
              <option key={sort} value={sort}>
                {t(`sort.${sort}`)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        {user && (
          <label className="flex items-center gap-2 text-emerald-700 font-bold">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(event) =>
                onChange({ ...filters, favoritesOnly: event.target.checked })
              }
            />
            {t("personal.onlyFavorites")}
          </label>
        )}
        <output aria-live="polite" className="text-stone-600 text-sm">
          {t(
            resultCount === 1 ? "filters.resultOne" : "filters.resultMany",
          ).replace("{count}", String(resultCount))}
        </output>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900"
        >
          {t("filters.reset")}
        </button>
      </div>
    </section>
  );
}
