"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { type FormErrorKey, getFormErrorKey } from "@/lib/form-errors";
import { getValidationKey } from "@/lib/form-validation";
import type { CurrentUser } from "@/lib/permissions";
import FormField, { formControlClassName } from "./FormField";
import ImageUploadPreview from "./ImageUploadPreview";

export default function ProfileForm({ user }: { user: CurrentUser }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<FormErrorKey | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      const input = event.currentTarget.elements.namedItem(
        "name",
      ) as HTMLInputElement;
      input.setCustomValidity(t("validation.required"));
      input.reportValidity();
      return;
    }
    setPending(true);
    setSaved(false);
    setError(null);
    let uploadingImage = false;
    try {
      let image = user.image ?? null;
      if (file) {
        uploadingImage = true;
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const result = await response.json();
        if (!response.ok) {
          setError(getFormErrorKey(result, "error.uploadImage"));
          return;
        }
        image = result.url;
        uploadingImage = false;
      }
      const result = await authClient.updateUser({ name: name.trim(), image });
      if (result.error) {
        setError(
          result.error.status === 429
            ? "error.tooManyAttempts"
            : "error.profile",
        );
        return;
      }
      setName(name.trim());
      setFile(null);
      setSaved(true);
      router.refresh();
    } catch {
      setError(uploadingImage ? "error.uploadImage" : "error.profile");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link
        href="/"
        className="font-medium text-emerald-700 hover:text-emerald-800"
      >
        &larr; {t("recipe.back")}
      </Link>
      <form
        onSubmit={submit}
        className="mt-6 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-3xl font-extrabold text-emerald-700">
          {t("profile.title")}
        </h1>
        <p className="mt-2 text-stone-500">{t("profile.description")}</p>
        <div className="mt-8 grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ImageUploadPreview
            initialImageUrl={user.image}
            label={t("profile.photo")}
            previewAlt={t("profile.photoPreview")}
            uploading={pending}
            onImageChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setSaved(false);
              setError(null);
            }}
          />
          <div className="min-w-0 space-y-5">
            <FormField label={t("auth.name")} htmlFor="profile-name">
              <input
                id="profile-name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                disabled={pending}
                onChange={(event) => {
                  event.target.setCustomValidity("");
                  setName(event.target.value);
                  setSaved(false);
                }}
                onInvalid={(event) => {
                  event.currentTarget.setCustomValidity("");
                  event.currentTarget.setCustomValidity(
                    t(getValidationKey(event.currentTarget.validity, "name")),
                  );
                }}
                className={formControlClassName}
              />
            </FormField>
            <div>
              <p className="text-sm font-bold text-emerald-700">
                {t("auth.email")}
              </p>
              <p className="mt-1 break-all text-stone-600">{user.email}</p>
              {user.role === "admin" && (
                <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {t("auth.admin")}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={pending || (!file && name.trim() === user.name)}
              className="rounded-full bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {t(pending ? "form.saving" : "form.save")}
            </button>
            {saved && (
              <output className="block text-emerald-700">
                {t("profile.saved")}
              </output>
            )}
            {error && (
              <p role="alert" className="text-red-600">
                {t(error)}
              </p>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
