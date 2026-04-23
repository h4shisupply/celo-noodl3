"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  buildRewardCopy,
  buildStampRuleCopy,
  resolveText,
  type StoreCatalogEntry
} from "../lib/catalog";
import { getDefaultChainId } from "../lib/chains";
import { useMiniPay } from "../lib/minipay";
import { useAutoDismissMessage } from "../lib/use-auto-dismiss-message";
import { useLocale } from "./locale-provider";
import { StoreLogo } from "./store-logo";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function HomePage({ stores }: { stores: StoreCatalogEntry[] }) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const [activePrimaryCta, setActivePrimaryCta] = useState<"header" | "hero" | "footer" | null>(
    null
  );
  const {
    account,
    connect,
    isConnecting,
    connectError,
    clearConnectError
  } = useMiniPay(getDefaultChainId());
  const primaryCtaLabel =
    locale === "pt-BR"
      ? account
        ? "Acessar meu dash"
        : "Quero participar"
      : account
        ? "Open my dashboard"
        : "Join noodl3";
  const primaryCtaDisplayLabel =
    isConnecting ? (locale === "pt-BR" ? "Conectando..." : "Connecting...") : primaryCtaLabel;
  const clearLandingConnectError = useCallback(() => {
    clearConnectError();
    setActivePrimaryCta(null);
  }, [clearConnectError]);
  const handlePrimaryCta = useCallback(
    async (source: "header" | "hero" | "footer") => {
      setActivePrimaryCta(source);

      if (account) {
        clearLandingConnectError();
        router.push("/app");
        return;
      }

      const nextAccount = await connect();
      if (!nextAccount) {
        return;
      }

      clearLandingConnectError();
      router.push("/app");
    },
    [account, clearLandingConnectError, connect, router]
  );

  useAutoDismissMessage(connectError, clearLandingConnectError);

  return (
    <main className="space-y-20 pb-24 md:space-y-28 md:pb-28">
      <SiteHeader
        brandHref="/"
        items={[
          { href: "#how", label: dictionary.nav.howItWorks },
          { href: "#stores", label: dictionary.nav.stores },
          { href: "#faq", label: dictionary.nav.faq }
        ]}
        cta={{
          label: primaryCtaDisplayLabel,
          onClick: () => void handlePrimaryCta("header"),
          isLoading: isConnecting
        }}
      />
      {activePrimaryCta === "header" && connectError ? (
        <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
          {connectError}
        </p>
      ) : null}

      <section className="grid gap-12 pt-0 lg:grid-cols-[minmax(0,1.25fr)_24rem] lg:items-end">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
              {dictionary.landing.eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-[#18122A] md:text-6xl md:leading-[1.02]">
              {dictionary.landing.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[#625B78] md:text-lg">
              {dictionary.landing.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => void handlePrimaryCta("hero")}
              disabled={isConnecting}
            >
              {primaryCtaDisplayLabel}
            </Button>
            <Link href="#stores">
              <Button size="lg" variant="outline">
                {dictionary.actions.exploreStores}
              </Button>
            </Link>
          </div>
          {activePrimaryCta === "hero" && connectError ? (
            <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {connectError}
            </p>
          ) : null}

          <div className="grid gap-4 pt-4 text-sm text-[#4C4660] md:grid-cols-3">
            {dictionary.landing.stats.map((stat) => (
              <div key={stat} className="border-t border-[#E7E2F1] pt-4">
                {stat}
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>{dictionary.landing.valueTitle}</CardTitle>
            <CardDescription>{dictionary.landing.valueDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {dictionary.landing.valuePoints.map((point) => (
              <p key={point} className="border-t border-[#EEE8F5] pt-4 text-sm leading-7 text-[#3D3653]">
                {point}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="how" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
            {dictionary.nav.howItWorks}
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-4xl">
            {dictionary.landing.howTitle}
          </h2>
          <p className="text-base leading-8 text-[#625B78]">
            {dictionary.landing.howDescription}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {dictionary.landing.steps.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="space-y-4 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A90B0]">
                  0{index + 1}
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#18122A]">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-[#625B78]">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="stores" className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
              {dictionary.common.storesLabel}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-4xl">
              {dictionary.landing.storesTitle}
            </h2>
            <p className="text-base leading-8 text-[#625B78]">
              {dictionary.landing.storesDescription}
            </p>
          </div>

          <Link href="/app">
            <Button variant="outline">{dictionary.actions.exploreStores}</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.slug} className="overflow-hidden">
              <div className={`h-32 bg-gradient-to-br ${store.accent}`} />
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-start gap-4">
                  <StoreLogo
                    name={resolveText(store.name, locale)}
                    imageUrl={store.storeLogoUrl}
                    size="lg"
                    className="-mt-14 border-white bg-white shadow-[0_18px_40px_rgba(23,18,42,0.12)]"
                  />
                  <div className="space-y-2 pt-1">
                    <p className="text-2xl font-semibold tracking-[-0.03em] text-[#18122A]">
                      {resolveText(store.name, locale)}
                    </p>
                    <p className="text-sm text-[#625B78]">
                      {resolveText(store.category, locale)} · {resolveText(store.city, locale)}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-[#625B78]">
                  {resolveText(store.summary, locale)}
                </p>
                <div className="space-y-2 border-t border-[#EEE8F5] pt-4">
                  <p className="text-sm font-medium text-[#18122A]">
                    {buildRewardCopy(store, locale)}
                  </p>
                  <p className="text-sm text-[#625B78]">
                    {buildStampRuleCopy(store, locale)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
              {dictionary.common.onchainVerified}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-4xl">
              {dictionary.landing.trustTitle}
            </h2>
            <p className="text-base leading-8 text-[#625B78]">
              {dictionary.landing.trustDescription}
            </p>
          </div>

          <div className="grid gap-4">
            {dictionary.landing.trustBullets.map((bullet) => (
              <Card key={bullet}>
                <CardContent className="pt-6">
                  <p className="text-sm leading-7 text-[#3D3653]">{bullet}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div id="faq" className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
              {dictionary.nav.faq}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-4xl">
              {dictionary.landing.faqTitle}
            </h2>
          </div>

          <div className="grid gap-4">
            {dictionary.landing.faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="space-y-2 pt-6">
                  <p className="text-base font-semibold text-[#18122A]">{faq.question}</p>
                  <p className="text-sm leading-7 text-[#625B78]">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-[#EBE5F3] bg-white px-6 py-8 shadow-[0_24px_80px_rgba(23,18,42,0.06)] md:px-10 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B3FE4]">
              {dictionary.common.rewardsLabel}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-4xl">
              {dictionary.landing.footerTitle}
            </h2>
            <p className="text-base leading-8 text-[#625B78]">
              {dictionary.landing.footerDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => void handlePrimaryCta("footer")}
              disabled={isConnecting}
            >
              {primaryCtaDisplayLabel}
            </Button>
            <Link href="#stores">
              <Button size="lg" variant="outline">
                {dictionary.actions.exploreStores}
              </Button>
            </Link>
          </div>
          {activePrimaryCta === "footer" && connectError ? (
            <p className="w-full rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {connectError}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
