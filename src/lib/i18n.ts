import type { BilingualText } from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

type LocalizedRecord = {
  zh: string;
  en: string;
};

export function pickLocalizedText(
  copy: BilingualText | LocalizedRecord | null | undefined,
  language: AppLanguage
) {
  if (!copy) {
    return "";
  }

  const preferred = language === "zh" ? copy.zh : copy.en;
  const fallback = language === "zh" ? copy.en : copy.zh;

  return preferred?.trim() || fallback?.trim() || "";
}
