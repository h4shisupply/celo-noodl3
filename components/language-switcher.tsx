"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale } from "../lib/i18n";
import { useLocale } from "./locale-provider";

const localeOptions: Array<{ value: Locale; label: string; name: string }> = [
  { value: "pt-BR", label: "PT", name: "Português" },
  { value: "en", label: "EN", name: "English" }
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocale();
  const languageLabel = locale === "pt-BR" ? "Idioma" : "Language";
  const currentLanguageLabel = locale === "pt-BR" ? "Idioma atual" : "Current language";
  const switchLanguageLabel = locale === "pt-BR" ? "Mudar idioma para" : "Switch language to";

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border border-line bg-panel p-1 shadow-card"
      role="group"
      aria-label={languageLabel}
    >
      {localeOptions.map((option) => {
        const active = option.value === locale;

        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            aria-label={
              active
                ? `${currentLanguageLabel}: ${option.name}`
                : `${switchLanguageLabel} ${option.name}`
            }
            aria-pressed={active}
            onClick={() => changeLocale(option.value)}
            className={`rounded-md px-3 py-2 text-xs font-semibold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus ${
              active
                ? "bg-ink text-white"
                : "text-muted hover:bg-accent-soft"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
