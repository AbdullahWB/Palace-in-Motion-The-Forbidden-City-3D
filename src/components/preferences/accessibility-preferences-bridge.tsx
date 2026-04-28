"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";

export function AccessibilityPreferencesBridge() {
  const accessibilityPreferences = useAppStore(
    (state) => state.accessibilityPreferences
  );

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.accessibilityText = accessibilityPreferences.textScale;
    root.dataset.accessibilityContrast = accessibilityPreferences.contrast;
    root.dataset.accessibilityReducedMotion =
      accessibilityPreferences.reduceMotion ? "true" : "false";
    root.dataset.accessibilitySimplified = accessibilityPreferences.simplified
      ? "true"
      : "false";
    root.dataset.accessibilityReadableLabels =
      accessibilityPreferences.readableLabels ? "true" : "false";
    root.dataset.accessibilityKeyboardFocus =
      accessibilityPreferences.keyboardFocus ? "true" : "false";

    return () => {
      delete root.dataset.accessibilityText;
      delete root.dataset.accessibilityContrast;
      delete root.dataset.accessibilityReducedMotion;
      delete root.dataset.accessibilitySimplified;
      delete root.dataset.accessibilityReadableLabels;
      delete root.dataset.accessibilityKeyboardFocus;
    };
  }, [accessibilityPreferences]);

  return null;
}
