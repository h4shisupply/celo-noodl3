import Link from "next/link";
import { cookies, headers } from "next/headers";
import { findStoreBySlug, resolveText } from "../../../lib/catalog";
import { getResolvedStoreCatalog } from "../../../lib/catalog-server";
import { getDictionary, interpolate, resolveLocaleFromRequest } from "../../../lib/i18n";

type StoreRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: StoreRouteProps) {
  const resolvedParams = await params;
  const locale = resolveLocaleFromRequest(await cookies(), await headers());
  const dictionary = getDictionary(locale);
  const store = findStoreBySlug(getResolvedStoreCatalog(), resolvedParams.slug);
  const storeName = store ? resolveText(store.name, locale) : dictionary.common.storesLabel;

  return (
    <main className="min-h-screen bg-[#FCFBFE] px-6 py-10 text-[#18122A]">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[40px] border border-[#E7E1F1] bg-white px-8 py-10 text-center shadow-[0_28px_90px_rgba(23,18,42,0.08)] sm:px-12 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
            noodl3
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#18122A] sm:text-5xl">
            {interpolate(dictionary.store.redirectTitle, { store: storeName })}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#625B78]">
            {dictionary.store.redirectDescription}
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/app"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#17122A] px-6 text-sm font-medium text-white transition hover:bg-[#0E0A1C]"
            >
              {dictionary.actions.backToDashboard}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
