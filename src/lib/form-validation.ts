import type { TranslationKey } from "@/lib/dictionary";

export function getValidationKey(
  validity: ValidityState,
  name: string,
): TranslationKey {
  if (validity.valueMissing) return "validation.required";
  if (name === "sourceUrl" && validity.typeMismatch) return "validation.url";
  if (name === "cookMinutes") return "validation.cookTime";
  return "validation.invalid";
}
