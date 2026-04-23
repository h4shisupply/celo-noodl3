import { useEffect } from "react";

export function useAutoDismissMessage(
  message: string | null | undefined,
  clear: () => void,
  delayMs = 3000
) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clear();
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clear, delayMs, message]);
}
