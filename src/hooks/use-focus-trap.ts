import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const root = ref.current;

    if (!root) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => element.offsetParent !== null);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    (firstElement ?? root).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    root.addEventListener("keydown", handleKeyDown);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [enabled, ref]);
}
