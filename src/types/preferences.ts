export type AppLanguage = "zh" | "en";
export type AppTheme = "dark" | "light";

export type AccessibilityPreferences = {
  textScale: "standard" | "large" | "extra-large";
  contrast: "standard" | "high";
  reduceMotion: boolean;
  simplified: boolean;
  readableLabels: boolean;
  keyboardFocus: boolean;
};
