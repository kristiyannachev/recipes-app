import { dictionary, type TranslationKey } from "@/lib/dictionary";

export type FormErrorKey = Extract<TranslationKey, `error.${string}`>;

export function getFormErrorKey(
  payload: unknown,
  fallback: FormErrorKey,
): FormErrorKey {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("errorCode" in payload)
  )
    return fallback;
  const code = payload.errorCode;
  return typeof code === "string" &&
    code.startsWith("error.") &&
    Object.hasOwn(dictionary.en, code)
    ? (code as FormErrorKey)
    : fallback;
}
