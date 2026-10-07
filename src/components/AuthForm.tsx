"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authClient } from "@/lib/auth-client";
import type { FormErrorKey } from "@/lib/form-errors";
import { getValidationKey } from "@/lib/form-validation";
import FormField, { formControlClassName } from "./FormField";

export default function AuthForm({
  mode,
  next,
}: {
  mode: "sign-in" | "sign-up";
  next: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormErrorKey | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    for (const field of formRef.current?.querySelectorAll<HTMLInputElement>(
      "input",
    ) ?? []) {
      if (!field.validity.customError) continue;
      field.setCustomValidity("");
      if (!field.validity.valid)
        field.setCustomValidity(
          t(getValidationKey(field.validity, field.name)),
        );
    }
  }, [t]);
  const signup = mode === "sign-up";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const credentials = {
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
      };
      const result = signup
        ? await authClient.signUp.email({
            ...credentials,
            name: String(data.get("name")).trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        const code = result.error.code;
        setError(
          code === "INVALID_EMAIL_OR_PASSWORD"
            ? "error.credentials"
            : code === "USER_ALREADY_EXISTS" ||
                code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
              ? "error.emailExists"
              : result.error.status === 429
                ? "error.tooManyAttempts"
                : "error.auth",
        );
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("error.auth");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="max-w-md mx-auto p-6">
      <Link href="/" className="text-emerald-700">
        &larr; {t("recipe.back")}
      </Link>
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-6">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6">
          {t(signup ? "auth.signUp" : "auth.signIn")}
        </h1>
        <form
          ref={formRef}
          onSubmit={submit}
          onInvalidCapture={(event) => {
            if (event.target instanceof HTMLInputElement) {
              event.target.setCustomValidity("");
              event.target.setCustomValidity(
                t(getValidationKey(event.target.validity, event.target.name)),
              );
            }
          }}
          onInputCapture={(event) => {
            if (event.target instanceof HTMLInputElement)
              event.target.setCustomValidity("");
          }}
          className="space-y-5"
        >
          {signup && (
            <FormField label={t("auth.name")} htmlFor="name">
              <input
                id="name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                className={formControlClassName}
              />
            </FormField>
          )}
          <FormField label={t("auth.email")} htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={formControlClassName}
            />
          </FormField>
          <FormField label={t("auth.password")} htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={signup ? 12 : undefined}
              maxLength={128}
              autoComplete={signup ? "new-password" : "current-password"}
              className={formControlClassName}
            />
          </FormField>
          {signup && (
            <p className="text-sm text-stone-500">{t("auth.passwordHint")}</p>
          )}
          {error && (
            <p role="alert" className="text-red-600">
              {t(error)}
            </p>
          )}
          <button
            disabled={pending}
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-full font-bold disabled:opacity-50"
          >
            {t(
              pending ? "auth.pending" : signup ? "auth.signUp" : "auth.signIn",
            )}
          </button>
        </form>
        <Link
          className="block text-emerald-700 mt-6 text-center"
          href={`/${signup ? "sign-in" : "sign-up"}?next=${encodeURIComponent(next)}`}
        >
          {t(signup ? "auth.haveAccount" : "auth.createAccount")}
        </Link>
      </div>
    </main>
  );
}
