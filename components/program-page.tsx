"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import {
  fetchIsProgramStaff,
  fetchPendingVisitRequestId,
  fetchProgram,
  fetchProgress,
  type ProgramRecord,
  type ProgressRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatProgramCode, programCopy } from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import {
  claimRewardTx,
  collectDynamicStampTx,
  extractClaimIdFromReceipt,
  requestVisitTx,
  waitForTransaction
} from "../lib/wallet";

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
  const [pendingRequestId, setPendingRequestId] = useState<bigint>(0n);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const [nextProgram, nextProgress, nextPendingRequestId, nextIsStaff] =
        await Promise.all([
          fetchProgram(programId, initialChainId, contractAddress),
          account && !isWrongChain
            ? fetchProgress(account, programId, initialChainId, contractAddress)
            : Promise.resolve(null),
          account && !isWrongChain
            ? fetchPendingVisitRequestId(programId, account, initialChainId, contractAddress)
            : Promise.resolve(0n),
          account && !isWrongChain
            ? fetchIsProgramStaff(programId, account, initialChainId, contractAddress)
            : Promise.resolve(false)
        ]);

      setProgram(nextProgram);
      setProgress(nextProgress);
      setPendingRequestId(nextPendingRequestId);
      setIsStaff(nextIsStaff);
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

  async function ensureAccount() {
    if (account) return account;
    return connect();
  }

  async function handleRequestVisit() {
    const connectedAccount = await ensureAccount();
    if (!connectedAccount || !contractAddress) return;

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const hash = await requestVisitTx({
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

  const canCollectDynamic = visitMode === "dynamic" && nonce && expiresAt && signature;
  const canRequestStatic = visitMode === "static" || !visitMode;

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
      backHref="/app"
      backLabel={dictionary.actions.backToDashboard}
      title={program?.name ?? copy.collectVisit}
      description={program?.rewardDescription ?? copy.appDescription}
    >
      <section className="mx-auto max-w-3xl space-y-6">
        {isLoading ? (
          <EmptyState title={dictionary.common.loading} description="" />
        ) : !program ? (
          <EmptyState title={copy.notFound} description={formatProgramCode(programId)} />
        ) : (
          <Card>
            <CardHeader className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
                {formatProgramCode(program.id)} {!program.active ? `· ${copy.inactive}` : ""}
              </p>
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>{program.rewardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressMeter
                value={progress?.stamps ?? 0}
                total={program.stampsRequired}
                unitLabel={copy.stamps}
              />

              <div className="flex flex-wrap gap-3">
                {canCollectDynamic ? (
                  <Button onClick={() => void handleCollectDynamic()} disabled={isSubmitting || !program.active}>
                    {isSubmitting ? `${copy.collectVisit}...` : copy.collectVisit}
                  </Button>
                ) : null}

                {canRequestStatic ? (
                  <Button
                    variant={canCollectDynamic ? "outline" : "primary"}
                    onClick={() => void handleRequestVisit()}
                    disabled={isSubmitting || !program.active || pendingRequestId !== 0n}
                  >
                    {pendingRequestId !== 0n ? copy.requestSent : copy.requestStamp}
                  </Button>
                ) : null}

                {progress?.canClaim ? (
                  <Button variant="outline" onClick={() => void handleClaimReward()} disabled={isSubmitting}>
                    {copy.claimReward}
                  </Button>
                ) : null}

                {isStaff ? (
                  <Link href={`/app/program/${program.id.toString()}/manage`}>
                    <Button variant="ghost">{copy.manage}</Button>
                  </Link>
                ) : null}
              </div>

              {status ? <p className="text-sm text-[#2D7A46]">{status}</p> : null}
              {error || connectError ? (
                <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
                  {error || connectError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </section>
    </AppChrome>
  );
}
