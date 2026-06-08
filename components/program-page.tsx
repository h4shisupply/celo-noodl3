"use client";

import { BadgeCheck, Gift, Settings, Stamp, TimerReset } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { CountdownBadge } from "./countdown-badge";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { StatusMessage } from "./ui/status-message";
import {
  fetchLastStaticStampAt,
  fetchProgram,
  fetchProgress,
  type ProgramRecord,
  type ProgressRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatDateTime, formatProgramCode, programCopy } from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import {
  claimRewardTx,
  collectDynamicStampTx,
  collectStaticStampTx,
  extractClaimIdFromReceipt,
  waitForTransaction
} from "../lib/wallet";

const STATIC_STAMP_COOLDOWN_SECONDS = 20 * 60 * 60;

export function ProgramPage({
  programId,
  visitMode,
  nonce,
  expiresAt,
  signature,
  initialChainId,
  contractAddresses
}: {
  programId: bigint;
  visitMode?: string;
  nonce?: Hex;
  expiresAt?: bigint | null;
  signature?: Hex;
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const { locale, dictionary } = useLocale();
  const copy = programCopy(locale);
  const [program, setProgram] = useState<ProgramRecord | null>(null);
  const [progress, setProgress] = useState<ProgressRecord | null>(null);
  const [lastStaticStampAt, setLastStaticStampAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
  const {
    account,
    chainId,
    expectedChainId,
    expectedChainLabel,
    hasProvider,
    hasCheckedProvider,
    isMiniPay,
    isConnecting,
    isDisconnectedByUser,
    isWrongChain,
    connect,
    switchToDefaultChain,
    refreshWalletState,
    disconnect,
    connectError
  } = useMiniPay(initialChainId);
  const contractAddress = useMemo(
    () => resolveContractAddressForChain(initialChainId, contractAddresses),
    [contractAddresses, initialChainId]
  );

  const loadProgram = useCallback(async () => {
    if (!contractAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [nextProgram, nextProgress, nextLastStaticStampAt] = await Promise.all([
        fetchProgram(programId, initialChainId, contractAddress),
        account && !isWrongChain
          ? fetchProgress(account, programId, initialChainId, contractAddress)
          : Promise.resolve(null),
        account && !isWrongChain
          ? fetchLastStaticStampAt(account, programId, initialChainId, contractAddress)
          : Promise.resolve(0)
      ]);

      setProgram(nextProgram);
      setProgress(nextProgress);
      setLastStaticStampAt(nextLastStaticStampAt);
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed));
    } finally {
      setIsLoading(false);
    }
  }, [
    account,
    contractAddress,
    dictionary.messages.genericActionFailed,
    initialChainId,
    isWrongChain,
    programId
  ]);

  useEffect(() => {
    void loadProgram();
  }, [loadProgram]);

  useEffect(() => {
    if (visitMode !== "dynamic" || !expiresAt) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt, visitMode]);

  async function ensureAccount() {
    if (account) return account;
    return connect();
  }

  async function handleCollectStatic() {
    const connectedAccount = await ensureAccount();
    if (!connectedAccount || !contractAddress) return;

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const hash = await collectStaticStampTx({
        contractAddress,
        programId,
        chainId: initialChainId
      });
      await waitForTransaction(hash, initialChainId);
      setStatus(copy.requestSent);
      await loadProgram();
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCollectDynamic() {
    const connectedAccount = await ensureAccount();
    if (!connectedAccount || !contractAddress || !nonce || !expiresAt || !signature) return;

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const hash = await collectDynamicStampTx({
        contractAddress,
        programId,
        nonce,
        expiresAt,
        signature,
        chainId: initialChainId
      });
      await waitForTransaction(hash, initialChainId);
      setStatus(copy.dynamicCollected);
      await loadProgram();
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClaimReward() {
    const connectedAccount = await ensureAccount();
    if (!connectedAccount || !contractAddress) return;

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const hash = await claimRewardTx({
        contractAddress,
        programId,
        chainId: initialChainId
      });
      const receipt = await waitForTransaction(hash, initialChainId);
      const claimId = extractClaimIdFromReceipt(receipt);
      setStatus(copy.rewardClaimed);
      window.location.href = claimId ? `/app/claim/${claimId.toString()}` : "/app";
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.claimFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

  const dynamicExpiresAtSeconds = expiresAt ? Number(expiresAt) : null;
  const isDynamicExpired =
    dynamicExpiresAtSeconds !== null && dynamicExpiresAtSeconds <= nowSeconds;
  const hasMalformedDynamicQr =
    visitMode === "dynamic" && (!nonce || !expiresAt || !signature);
  const canCollectDynamic =
    visitMode === "dynamic" && nonce && expiresAt && signature && !isDynamicExpired;
  const canCollectStatic = visitMode === "static";
  const staticNextAvailableAt = lastStaticStampAt + STATIC_STAMP_COOLDOWN_SECONDS;
  const isStaticCoolingDown =
    lastStaticStampAt > 0 && Math.floor(Date.now() / 1000) < staticNextAvailableAt;
  const isOwner =
    Boolean(program && account && program.owner.toLowerCase() === account.toLowerCase());

  return (
    <AppChrome
      walletState={{
        account,
        chainId,
        expectedChainId,
        expectedChainLabel,
        contractAddress,
        hasProvider,
        hasCheckedProvider,
        isMiniPay,
        isConnecting,
        isDisconnectedByUser,
        isWrongChain,
        connectError,
        connect,
        switchToDefaultChain,
        refreshWalletState,
        disconnect
      }}
      backHref="/app"
      backLabel={dictionary.actions.backToDashboard}
      title={program?.name ?? copy.collectVisit}
      description={program?.rewardDescription ?? copy.appDescription}
    >
      <section className="mx-auto max-w-3xl space-y-6">
        {!contractAddress ? (
          <EmptyState
            title={dictionary.common.contractMissing}
            description={copy.noContract}
            icon={<Stamp className="h-5 w-5" />}
          />
        ) : isLoading ? (
          <EmptyState
            title={dictionary.common.loading}
            description={copy.loadingProgram}
            icon={<Stamp className="h-5 w-5" />}
          />
        ) : !program ? (
          <EmptyState
            title={copy.notFound}
            description={formatProgramCode(programId)}
            icon={<Stamp className="h-5 w-5" />}
          />
        ) : (
          <Card className="overflow-hidden shadow-float">
            <CardHeader className="stamp-pattern space-y-4 border-b border-line bg-panel-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar name={program.name} imageUrl={program.iconUrl} size="lg" />
                  <div className="min-w-0 space-y-2">
                    <Badge dir="ltr" variant={program.active ? "accent" : "danger"}>
                      {formatProgramCode(program.id)} {!program.active ? `· ${copy.inactive}` : ""}
                    </Badge>
                    <CardTitle>{program.name}</CardTitle>
                    <CardDescription>{program.rewardDescription}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressMeter
                value={progress?.stamps ?? 0}
                total={program.stampsRequired}
                unitLabel={copy.stamps}
              />

              <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
                {dynamicExpiresAtSeconds ? (
                  <CountdownBadge
                    expiresAt={dynamicExpiresAtSeconds}
                    label={copy.liveQrExpiresIn}
                    expiredLabel={copy.liveQrExpired}
                  />
                ) : null}

                {canCollectDynamic ? (
                  <Button
                    icon={<Stamp className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                    onClick={() => void handleCollectDynamic()}
                    aria-busy={isSubmitting}
                    disabled={isSubmitting || !program.active}
                  >
                    {isSubmitting ? `${copy.collectVisit}...` : copy.collectVisit}
                  </Button>
                ) : null}

                {canCollectStatic ? (
                  <Button
                    variant={canCollectDynamic ? "outline" : "primary"}
                    icon={<BadgeCheck className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                    onClick={() => void handleCollectStatic()}
                    aria-busy={isSubmitting}
                    disabled={
                      isSubmitting ||
                      !program.active ||
                      !program.staticStampEnabled ||
                      isStaticCoolingDown
                    }
                  >
                    {copy.requestStamp}
                  </Button>
                ) : null}

                {progress?.canClaim ? (
                  <Button
                    variant="warm"
                    icon={<Gift className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                    onClick={() => void handleClaimReward()}
                    aria-busy={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {copy.claimReward}
                  </Button>
                ) : null}

                {isOwner ? (
                  <Link
                    href={`/app/program/${program.id.toString()}/manage`}
                    aria-label={`${copy.manage}: ${program.name}`}
                    className="inline-flex min-h-11 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2.5 text-sm font-semibold text-muted transition duration-200 hover:bg-accent-soft hover:text-ink active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
                      <Settings className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 whitespace-normal text-center leading-tight">
                      {copy.manage}
                    </span>
                  </Link>
                ) : null}
              </div>

              {hasMalformedDynamicQr ? (
                <StatusMessage tone="error">{copy.invalidVisitQr}</StatusMessage>
              ) : null}

              {isDynamicExpired ? (
                <StatusMessage tone="warning">{copy.dynamicExpiredHelp}</StatusMessage>
              ) : null}

              {canCollectStatic && !program.staticStampEnabled ? (
                <StatusMessage tone="warning">{copy.staticDisabledHelp}</StatusMessage>
              ) : null}

              {canCollectStatic && lastStaticStampAt > 0 ? (
                <p className="flex items-center gap-2 rounded-lg border border-line bg-panel-soft px-3 py-2 text-sm text-muted">
                  <TimerReset className="h-4 w-4" aria-hidden="true" />
                  {copy.nextStaticStamp}: {formatDateTime(staticNextAvailableAt, locale)}
                </p>
              ) : null}

              {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
              {error || connectError ? (
                <StatusMessage tone="error">{error || connectError}</StatusMessage>
              ) : null}
            </CardContent>
          </Card>
        )}
      </section>
    </AppChrome>
  );
}
