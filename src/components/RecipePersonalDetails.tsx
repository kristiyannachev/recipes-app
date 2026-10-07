"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { type FormErrorKey, getFormErrorKey } from "@/lib/form-errors";
import { formControlClassName } from "./FormField";

export type PersonalDetails = { isFavorite: boolean; note: string };

export default function RecipePersonalDetails({
  recipeId,
  initial,
}: {
  recipeId: string;
  initial: PersonalDetails | null;
}) {
  const { t } = useLanguage();
  const user = useUser();
  const router = useRouter();
  const [favorite, setFavorite] = useState(initial?.isFavorite ?? false);
  const [note, setNote] = useState(initial?.note ?? "");
  const [savedNote, setSavedNote] = useState(initial?.note ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<FormErrorKey | null>(null);
  async function save(data: Partial<PersonalDetails>) {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/preference`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(getFormErrorKey(result, "error.preference"));
        return;
      }
      if (data.isFavorite !== undefined) setFavorite(result.isFavorite);
      if (data.note !== undefined) {
        setSavedNote(result.note);
        setSaved(true);
      }
      router.refresh();
    } catch {
      setError("error.preference");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-emerald-700">
        {t("personal.title")}
      </h2>
      {user ? (
        <>
          <button
            type="button"
            aria-pressed={favorite}
            disabled={pending}
            onClick={() => save({ isFavorite: !favorite })}
            className="rounded-full px-5 py-2 font-bold bg-orange-100 text-emerald-700"
          >
            {t(favorite ? "personal.removeFavorite" : "personal.addFavorite")}
          </button>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save({ note });
            }}
            className="space-y-3"
          >
            <label
              htmlFor="personal-note"
              className="block font-bold text-emerald-700"
            >
              {t("personal.note")}
            </label>
            <p className="text-sm text-stone-500">{t("personal.private")}</p>
            <textarea
              id="personal-note"
              disabled={pending}
              maxLength={5000}
              rows={4}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setSaved(false);
              }}
              className={formControlClassName}
            />
            <button
              type="submit"
              disabled={pending || note === savedNote}
              className="bg-emerald-600 text-white rounded-full px-5 py-2 font-bold disabled:opacity-50"
            >
              {t(pending ? "personal.saving" : "personal.saveNote")}
            </button>
            {saved && (
              <output className="block text-emerald-700">
                {t("personal.saved")}
              </output>
            )}
          </form>
          {error && (
            <p role="alert" className="text-red-600">
              {t(error)}
            </p>
          )}
        </>
      ) : (
        <Link
          href={`/sign-in?next=${encodeURIComponent(`/recipes/${recipeId}`)}`}
          className="text-emerald-700 underline"
        >
          {t("personal.signIn")}
        </Link>
      )}
    </section>
  );
}
