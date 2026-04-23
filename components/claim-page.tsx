"use client";

import { useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  buildRewardCopy,
  findStoreBySlug,
  type StoreCatalogEntry
} from "../lib/catalog";
import { buildClaimCode, buildClaimUrl, buildQrImageUrl, formatWalletLabel } from "../lib/claim-code";
import { buildDashboardUrl } from "../lib/dashboard-route";
import { fetchClaim } from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { useMiniPay } from "../lib/minipay";
import { decodeStoreId } from "../lib/store-id";

export function ClaimPage({
  appUrl,
  stores,
  claimId,
  initialChainId,
  contractAddresses
}: {
  appUrl: string;
  stores: StoreCatalogEntry[];
  claimId: string;
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const { locale, dictionary } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState<Awaited<ReturnType<typeof fetchClaim>> | null>(null);
  const {
    account,
    chainId,
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
  } = useMiniPay(initialChainId);
  const contractAddress = useMemo(
    () => resolveContractAddressForChain(initialChainId, contractAddresses),
    [contractAddresses, initialChainId]
  );

  useEffect(() => {
    async function loadClaim() {
      if (!contractAddress) {
        setError(dictionary.common.contractMissing);
        return;
      }

      try {
        const claimRecord = await fetchClaim(BigInt(claimId), initialChainId, contractAddress);
        if (!claimRecord) {
          setError(dictionary.messages.rewardNotFound);
          return;
        }

        setClaim(claimRecord);
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : dictionary.messages.rewardNotFound
        );
      }
    }

    void loadClaim();
  }, [claimId, contractAddress, dictionary.common.contractMissing, dictionary.messages.rewardNotFound, initialChainId]);

  const store = useMemo(() => {
    if (!claim) return null;
    return findStoreBySlug(stores, decodeStoreId(claim.storeId));
  }, [claim, stores]);
  const claimUrl = claim ? buildClaimUrl(appUrl, claim.id) : null;
  const claimCode = claim && store ? buildClaimCode(store, claim.id) : null;

  return (
    <AppChrome
      walletState={{
        account,
        chainId,
        expectedChainId,
        expectedChainLabel,
        contractAddress,
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
      backHref={buildDashboardUrl({ role: "customer", tab: "rewards" })}
      backLabel={locale === "pt-BR" ? "Voltar ao dashboard" : "Back to dashboard"}
      eyebrow={dictionary.claim.eyebrow}
      title={dictionary.claim.title}
      description={dictionary.claim.description}
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>
              {store ? buildRewardCopy(store, locale) : dictionary.common.reward}
            </CardTitle>
            <CardDescription>
              {store?.name ? store.name[locale] : dictionary.claim.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {claimUrl ? (
              <div className="rounded-[32px] border border-[#ECEAF4] bg-[#FAF7FF] p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildQrImageUrl(claimUrl)}
                  alt={`QR for claim ${claimId}`}
                  className="mx-auto aspect-square w-full max-w-[280px] rounded-[28px] animate-pulse"
                />
              </div>
            ) : null}
            {claimCode ? (
              <div className="rounded-[24px] border border-[#ECEAF4] bg-white px-5 py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.common.backupCode}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold text-[#1B1630]">
                  {claimCode}
                </p>
              </div>
            ) : null}
            {claim ? (
              <div className="rounded-[24px] border border-[#ECEAF4] bg-[#FBFAFD] px-5 py-5">
                <p className="text-sm font-semibold text-[#1B1630]">
                  {dictionary.common.customer}: {formatWalletLabel(claim.user)}
                </p>
                <p className="mt-1 text-sm text-[#6D6783]">
                  {dictionary.common.status}:{" "}
                  {claim.consumed ? dictionary.common.used : dictionary.common.pending}
                </p>
              </div>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.claim.howToUseTitle}</CardTitle>
              <CardDescription>{dictionary.claim.howToUseDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm leading-7 text-[#6D6783]">
                {dictionary.claim.steps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
              {claimUrl ? (
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(claimUrl);
                  }}
                >
                  {dictionary.actions.copyLink}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppChrome>
  );
}
