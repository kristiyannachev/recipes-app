import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";
import { translate } from "@/lib/dictionary";
import { getLanguage, LANGUAGE_COOKIE } from "@/lib/language";
import { getCurrentUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const language = getLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return { title: translate(language, "app.title") };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = getLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  const user = await getCurrentUser();
  return (
    <html lang={language}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !bg-orange-200 !text-stone-800 min-h-screen`}
      >
        <LanguageProvider initialLanguage={language}>
          <UserProvider value={user}>
            <NavBar />
            {children}
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
