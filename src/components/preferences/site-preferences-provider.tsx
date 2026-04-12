"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_APP_LANGUAGE,
  DEFAULT_APP_THEME,
  SITE_LANGUAGE_STORAGE_KEY,
  SITE_THEME_STORAGE_KEY,
  applyDocumentPreferences,
} from "@/lib/site-preferences";
import type { AppLanguage, AppTheme } from "@/types/preferences";

type SitePreferencesContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const SitePreferencesContext = createContext<SitePreferencesContextValue | null>(
  null
);

export function SitePreferencesProvider({
  children,
  initialLanguage = DEFAULT_APP_LANGUAGE,
  initialTheme = DEFAULT_APP_THEME,
}: Readonly<{
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
  initialTheme?: AppTheme;
}>) {
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage);
  const [theme, setTheme] = useState<AppTheme>(initialTheme);

  useEffect(() => {
    applyDocumentPreferences(language, theme);

    try {
      window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, language);
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
      document.cookie = `${SITE_LANGUAGE_STORAGE_KEY}=${language}; Path=/; Max-Age=31536000`;
      document.cookie = `${SITE_THEME_STORAGE_KEY}=${theme}; Path=/; Max-Age=31536000`;
    } catch {
      // Ignore storage access issues and keep runtime state.
    }
  }, [language, theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
    }),
    [language, theme]
  );

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);

  if (!context) {
    throw new Error(
      "useSitePreferences must be used within SitePreferencesProvider."
    );
  }

  return context;
}
