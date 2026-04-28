import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { FloatingAIAssistant } from "@/components/layout/floating-ai-assistant";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AccessibilityPreferencesBridge } from "@/components/preferences/accessibility-preferences-bridge";
import { SitePreferencesProvider } from "@/components/preferences/site-preferences-provider";
import { GlobalMusicToggle } from "@/components/media/global-music-toggle";
import { SiteMusicProvider } from "@/components/media/site-music-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import {
  DEFAULT_APP_LANGUAGE,
  DEFAULT_APP_THEME,
  SITE_LANGUAGE_STORAGE_KEY,
  SITE_THEME_STORAGE_KEY,
  isAppLanguage,
  isAppTheme,
} from "@/lib/site-preferences";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "Forbidden City",
    "panorama experience",
    "immersive explore",
    "AI cultural guide",
    "Next.js",
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get(SITE_LANGUAGE_STORAGE_KEY)?.value;
  const themeCookie = cookieStore.get(SITE_THEME_STORAGE_KEY)?.value;
  const initialLanguage = isAppLanguage(languageCookie)
    ? languageCookie
    : DEFAULT_APP_LANGUAGE;
  const initialTheme = isAppTheme(themeCookie)
    ? themeCookie
    : DEFAULT_APP_THEME;

  return (
    <html
      lang={initialLanguage}
      data-theme={initialTheme}
      data-language={initialLanguage}
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        <SitePreferencesProvider
          initialLanguage={initialLanguage}
          initialTheme={initialTheme}
        >
          <AccessibilityPreferencesBridge />
          <SiteMusicProvider>
            <div className="flex min-h-screen flex-col">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
              >
                Skip to main content
              </a>
              <SiteHeader />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <SiteFooter />
            </div>
            <GlobalMusicToggle />
            <Suspense fallback={null}>
              <FloatingAIAssistant />
            </Suspense>
          </SiteMusicProvider>
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
