"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type Language,
  type TranslationKey,
  translate,
} from "@/lib/dictionary";
import { LANGUAGE_COOKIE } from "@/lib/language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [language, updateLanguage] = useState(initialLanguage);

  function setLanguage(nextLanguage: Language) {
    // biome-ignore lint/suspicious/noDocumentCookie: Works in browsers where Cookie Store is unavailable, including local HTTP development.
    document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`;
    updateLanguage(nextLanguage);
  }

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, "app.title");
  }, [language]);

  const t = (key: TranslationKey) => translate(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
