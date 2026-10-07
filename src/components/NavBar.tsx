"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { authClient } from "@/lib/auth-client";
import ShoppingCartIcon from "./ShoppingCartIcon";

export default function NavBar() {
  const { language, setLanguage, t } = useLanguage();
  const user = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <nav
      aria-label={t("nav.controls")}
      className="max-w-7xl mx-auto w-full px-6 pt-6 flex flex-wrap items-center justify-end gap-3"
    >
      {user ? (
        <>
          <span className="text-sm text-emerald-700 break-all">
            {user.name}
            {user.role === "admin" ? ` · ${t("auth.admin")}` : ""}
          </span>
          <button
            type="button"
            disabled={busy}
            className="text-sm font-bold text-emerald-700"
            onClick={async () => {
              setBusy(true);
              setFailed(false);
              try {
                const result = await authClient.signOut();
                if (result.error) {
                  setFailed(true);
                  return;
                }
                router.refresh();
              } catch {
                setFailed(true);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("auth.signOut")}
          </button>
          {failed && <span role="alert">{t("error.auth")}</span>}
        </>
      ) : (
        <Link href="/sign-in" className="text-sm font-bold text-emerald-700">
          {t("auth.signIn")}
        </Link>
      )}
      <div className="bg-white rounded-full shadow-xl border border-stone-100 p-1 flex">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === "en"
              ? "bg-orange-400 text-white"
              : "text-stone-500 hover:bg-stone-100"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("bg")}
          aria-pressed={language === "bg"}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === "bg"
              ? "bg-orange-400 text-white"
              : "text-stone-500 hover:bg-stone-100"
          }`}
        >
          BG
        </button>
      </div>
      <div className="bg-white rounded-full shadow-xl border border-stone-100">
        <ShoppingCartIcon />
      </div>
    </nav>
  );
}
