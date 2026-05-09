"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale } from "../lib/i18n";
import { useLocale } from "./locale-provider";

const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: "pt-BR", label: "PT" },
  { value: "en", label: "EN" }
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocale();

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-[#E5E1EE] bg-white p-1 shadow-[0_8px_18px_rgba(27,23,43,0.06)]">
      {localeOptions.map((option) => {
        const active = option.value === locale;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => changeLocale(option.value)}
            className={`rounded-md px-3 py-2 text-xs font-semibold tracking-[0.08em] transition ${
              active
                ? "bg-[#1B172B] text-white"
                : "text-[#676078] hover:bg-[#F6F3FC]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
