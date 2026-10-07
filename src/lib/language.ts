import type { Language } from "@/lib/dictionary";

export const LANGUAGE_COOKIE = "recipeLanguage";

export function getLanguage(value: unknown): Language {
  return value === "bg" ? "bg" : "en";
}
