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
  isAppLanguage,
  isAppTheme,
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE);
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_APP_THEME);

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
      const storedTheme = window.localStorage.getItem(SITE_THEME_STORAGE_KEY);

      if (isAppLanguage(storedLanguage)) {
        setLanguage(storedLanguage);
      }

      if (isAppTheme(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch {
      // Ignore storage access issues and keep defaults.
    }
  }, []);

  useEffect(() => {
    applyDocumentPreferences(language, theme);

    try {
      window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, language);
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
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
