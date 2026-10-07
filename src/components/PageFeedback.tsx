"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PageFeedback({
  kind,
  onRetry,
}: {
  kind: "notFound" | "error";
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <main className="max-w-3xl mx-auto p-6 text-center">
      <div
        role={kind === "error" ? "alert" : undefined}
        className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
      >
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-6">
          {t(kind === "notFound" ? "page.notFoundTitle" : "page.errorTitle")}
        </h1>
        <p className="text-lg text-stone-600 mb-8">
          {t(
            kind === "notFound" ? "page.notFoundMessage" : "page.errorMessage",
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600"
            >
              {t("page.retry")}
            </button>
          )}
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
          >
            {t("page.home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
