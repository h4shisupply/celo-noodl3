import { cookies, headers } from "next/headers";
import { HomePage } from "../components/home-page";
import { resolveLocaleFromRequest } from "../lib/i18n";

export default async function Page() {
  const locale = resolveLocaleFromRequest(await cookies(), await headers());
  return <HomePage locale={locale} />;
}
