"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { authClient } from "@/lib/auth-client";
import ShoppingCartIcon from "./ShoppingCartIcon";
import UserAvatar from "./UserAvatar";

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
          <Link
            href="/profile"
            aria-label={t("profile.title")}
            className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-stone-100 bg-white py-1.5 pl-1.5 pr-4 text-sm font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <UserAvatar name={user.name} image={user.image} />
            <span className="min-w-0 max-w-40 truncate">{user.name}</span>
          </Link>
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
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
        <Link
          href="/sign-in"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2"
        >
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
