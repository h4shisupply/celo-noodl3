import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { HomePage } from "../components/home-page";
import { resolveLocaleFromRequest } from "../lib/i18n";

export const metadata: Metadata = {
  title: "QR stamp cards for real-world visits",
  description:
    "Create counter QR stamp cards for real-world visits, collect visit stamps, and validate one-time reward tickets on Celo."
};

export default async function Page() {
  const locale = resolveLocaleFromRequest(await cookies(), await headers());
  return <HomePage locale={locale} />;
}
