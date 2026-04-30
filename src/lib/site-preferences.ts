import type {
  AppLanguage,
  AppLocaleDefinition,
  AppTheme,
} from "@/types/preferences";

export const SITE_LANGUAGE_STORAGE_KEY = "palace-language";
export const SITE_THEME_STORAGE_KEY = "palace-theme";

export const DEFAULT_APP_LANGUAGE: AppLanguage = "zh";
export const DEFAULT_APP_THEME: AppTheme = "dark";

export const SUPPORTED_APP_LOCALES: AppLocaleDefinition[] = [
  {
    language: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    direction: "ltr",
    enabled: true,
    signLanguageVideoBasePath: null,
  },
  {
    language: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    enabled: true,
    signLanguageVideoBasePath: null,
  },
];

export function isAppLanguage(value: unknown): value is AppLanguage {
  return SUPPORTED_APP_LOCALES.some((locale) => locale.language === value);
}

export function isAppTheme(value: unknown): value is AppTheme {
  return value === "dark" || value === "light";
}

export function applyDocumentPreferences(language: AppLanguage, theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.language = language;
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
}

export function getPreferenceBootScript() {
  return `
    (function () {
      var languageKey = ${JSON.stringify(SITE_LANGUAGE_STORAGE_KEY)};
      var themeKey = ${JSON.stringify(SITE_THEME_STORAGE_KEY)};
      var defaultLanguage = ${JSON.stringify(DEFAULT_APP_LANGUAGE)};
      var defaultTheme = ${JSON.stringify(DEFAULT_APP_THEME)};

      try {
        var storedLanguage = window.localStorage.getItem(languageKey);
        var storedTheme = window.localStorage.getItem(themeKey);
        var supportedLanguages = ${JSON.stringify(
          SUPPORTED_APP_LOCALES.map((locale) => locale.language)
        )};
        var language = supportedLanguages.indexOf(storedLanguage) >= 0 ? storedLanguage : defaultLanguage;
        var theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : defaultTheme;
        document.documentElement.dataset.language = language;
        document.documentElement.dataset.theme = theme;
        document.documentElement.lang = language;
      } catch (error) {
        document.documentElement.dataset.language = defaultLanguage;
        document.documentElement.dataset.theme = defaultTheme;
        document.documentElement.lang = defaultLanguage;
      }
    })();
  `;
}
