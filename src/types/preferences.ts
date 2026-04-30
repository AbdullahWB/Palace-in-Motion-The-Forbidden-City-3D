export type AppLanguage = "zh" | "en";
export type AppTheme = "dark" | "light";

export type AppLocaleDefinition = {
  language: AppLanguage;
  label: string;
  nativeLabel: string;
  direction: "ltr";
  enabled: true;
  signLanguageVideoBasePath?: string | null;
};

export type AccessibilityPreferences = {
  textScale: "standard" | "large" | "extra-large";
  contrast: "standard" | "high";
  reduceMotion: boolean;
  simplified: boolean;
  readableLabels: boolean;
  keyboardFocus: boolean;
};
