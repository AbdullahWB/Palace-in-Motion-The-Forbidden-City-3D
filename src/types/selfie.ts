import type { AppLanguage } from "@/types/preferences";

export type SelfieEnhanceRequest = {
  baseSceneDataUrl: string;
  subjectReferenceDataUrl: string;
  backgroundReferenceDataUrl: string;
  placeTitle: string;
  focusLabel: string;
  language: AppLanguage;
};

export type SelfieEnhanceResponse = {
  enhancedSceneDataUrl: string;
  provider: "gemini";
  model: string;
  warning?: string;
  error?: string;
};

export type AiEnhancedScene = {
  dataUrl: string;
  provider: "gemini";
  model: string;
};
