"use client";

import Link from "next/link";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getItemById, findStoreBySlug, resolveText, type StoreCatalogEntry } from "../lib/catalog";
import { getExplorerBaseUrl } from "../lib/chains";
import { buildDashboardUrl } from "../lib/dashboard-route";
import { interpolate } from "../lib/i18n";
import { useMiniPay } from "../lib/minipay";

export function SuccessPage({
  chainId,
  stores,
  mode,
  txHash,
  storeSlug,
  itemId,
  claimId
}: {
  chainId: number;
  stores: StoreCatalogEntry[];
  mode?: string;
  txHash?: string;
  storeSlug?: string;
  itemId?: string;
  claimId?: string;
}) {
  const { locale, dictionary } = useLocale();
  const {
    account,
    chainId: currentChainId,
    expectedChainId,
    expectedChainLabel,
    hasProvider,
    isMiniPay,
    isConnecting,
    isDisconnectedByUser,
    isWrongChain,
    connect,
    switchToDefaultChain,
    refreshWalletState,
    disconnect
  } = useMiniPay(chainId);
  const store = storeSlug ? findStoreBySlug(stores, storeSlug) : null;
  const item = storeSlug ? getItemById(stores, storeSlug, itemId) : null;
  const isConsume = mode === "consume";

  return (
    <AppChrome
      walletState={{
        account,
        chainId: currentChainId,
        expectedChainId,
        expectedChainLabel,
        contractAddress: null,
        hasProvider,
        isMiniPay,
        isConnecting,
        isDisconnectedByUser,
        isWrongChain,
        connect,
        switchToDefaultChain,
        refreshWalletState,
        disconnect
      }}
      backHref={
        isConsume
          ? buildDashboardUrl({ role: "merchant", tab: "rewards" })
          : buildDashboardUrl({ role: "customer", tab: "rewards" })
      }
      backLabel={locale === "pt-BR" ? "Voltar ao dashboard" : "Back to dashboard"}
      eyebrow={isConsume ? dictionary.success.consumeEyebrow : dictionary.success.purchaseEyebrow}
      title={isConsume ? dictionary.success.consumeTitle : dictionary.success.purchaseTitle}
      description={
        isConsume
          ? dictionary.success.consumeDescription
          : dictionary.success.purchaseDescription
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{store ? resolveText(store.name, locale) : dictionary.brand.name}</CardTitle>
            <CardDescription>
              {isConsume
                ? interpolate(dictionary.success.consumeDetail, {
                    claimId: claimId ?? ""
                  })
                : interpolate(dictionary.success.purchaseDetail, {
                    item: item ? resolveText(item.name, locale) : dictionary.common.reward
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {txHash ? (
              <div className="rounded-[24px] border border-[#ECEAF4] bg-[#FBFAFD] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.common.transaction}
                </p>
                <p className="mt-2 break-all text-sm text-[#1B1630]">{txHash}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link
                href={
                  isConsume
                    ? buildDashboardUrl({
                        role: "merchant",
                        scanner: "claim",
                        claim: claimId
                      })
                    : buildDashboardUrl({
                        role: "customer",
                        tab: "rewards"
                      })
                }
              >
                <Button>
                  {isConsume
                    ? dictionary.actions.backToVerifier
                    : dictionary.actions.backToRewards}
                </Button>
              </Link>
              <Link
                href={
                  isConsume
                    ? buildDashboardUrl({ role: "merchant", tab: "users" })
                    : store
                      ? `/app/store/${store.slug}`
                      : "/app"
                }
              >
                <Button variant="outline">
                  {isConsume
                    ? locale === "pt-BR"
                      ? "Voltar ao dashboard"
                      : "Back to dash"
                    : store
                      ? dictionary.actions.backToStore
                      : dictionary.actions.openApp}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.success.nextStepTitle}</CardTitle>
            <CardDescription>
              {isConsume
                ? dictionary.success.consumeDescription
                : dictionary.success.purchaseDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm leading-7 text-[#6D6783]">
              {(isConsume
                ? dictionary.success.consumeNextSteps
                : dictionary.success.purchaseNextSteps
              ).map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ul>
            {txHash ? (
              <a
                href={`${getExplorerBaseUrl(chainId)}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary">{dictionary.actions.openExplorer}</Button>
              </a>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppChrome>
  );
}
