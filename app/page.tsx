import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { HomePage } from "../components/home-page";
import { resolveLocaleFromRequest } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Merchant QR stamp cards for real-world visits",
  description:
    "Create merchant QR stamp cards for real-world visits, collect visit stamps, and validate each reward ticket once on Celo."
};

export default async function Page() {
  const locale = resolveLocaleFromRequest(await cookies(), await headers());
  return <HomePage locale={locale} />;
}
