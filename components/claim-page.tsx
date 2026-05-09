"use client";

import { BadgeCheck, Gift, QrCode, TicketCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { StatusMessage } from "./ui/status-message";
import {
  fetchClaim,
  fetchProgram,
  type ClaimRecord,
  type ProgramRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatWalletLabel } from "../lib/claim-code";
import {
  buildClaimUrl,
  buildQrImageUrl,
  formatClaimCode,
  formatDateTime,
  formatProgramCode,
  programCopy
} from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import { consumeRewardTx, waitForTransaction } from "../lib/wallet";

export function ClaimPage({
  appUrl,
  claimId,
  initialChainId,
  contractAddresses
}: {
  appUrl: string;
  claimId: string;
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const { locale, dictionary } = useLocale();
  const copy = programCopy(locale);
  const [claim, setClaim] = useState<ClaimRecord | null>(null);
  const [program, setProgram] = useState<ProgramRecord | null>(null);
  const [canConsume, setCanConsume] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parsedClaimId = useMemo(() => {
    try {
      const id = BigInt(claimId);
      return id > 0n ? id : null;
    } catch {
      return null;
    }
  }, [claimId]);
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

  const claimUrl = parsedClaimId ? buildClaimUrl(appUrl, parsedClaimId) : null;

  const loadClaim = useCallback(async () => {
    if (!contractAddress || !parsedClaimId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const nextClaim = await fetchClaim(parsedClaimId, initialChainId, contractAddress);
      setClaim(nextClaim);

      if (!nextClaim) {
        setProgram(null);
        setCanConsume(false);
        return;
      }

      const nextProgram = await fetchProgram(nextClaim.programId, initialChainId, contractAddress);
      const nextCanConsume =
        Boolean(
          nextProgram &&
            account &&
            !isWrongChain &&
            nextProgram.owner.toLowerCase() === account.toLowerCase()
        );
      setProgram(nextProgram);
      setCanConsume(nextCanConsume);
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.rewardNotFound));
    } finally {
      setIsLoading(false);
    }
  }, [
    account,
    contractAddress,
    dictionary.messages.rewardNotFound,
    initialChainId,
    isWrongChain,
    parsedClaimId
  ]);

  useEffect(() => {
    void loadClaim();
  }, [loadClaim]);

  async function handleConsume() {
    if (!account) {
      await connect();
      return;
    }
    if (!contractAddress || !parsedClaimId) return;

    setIsSubmitting(true);
    setStatus(null);
    setError(null);
    try {
      const hash = await consumeRewardTx({
        contractAddress,
        claimId: parsedClaimId,
        chainId: initialChainId
      });
      await waitForTransaction(hash, initialChainId);
      setStatus(copy.claimConsumed);
      await loadClaim();
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.consumeFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

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
      title={copy.claimTitle}
      description={copy.claimDescription}
    >
      <section className="mx-auto max-w-2xl space-y-6">
        {isLoading ? (
          <EmptyState
            title={dictionary.common.loadingReward}
            description={copy.loadingClaim}
            icon={<Gift className="h-5 w-5" />}
          />
        ) : !claim ? (
          <EmptyState
            title={dictionary.messages.rewardNotFound}
            description={claimId}
            icon={<TicketCheck className="h-5 w-5" />}
          />
        ) : (
          <Card>
            <CardHeader className="stamp-pattern space-y-3 rounded-t-lg border-b border-[#E5E1EE] bg-[#FBFCFF]">
              {program ? (
                <Avatar name={program.name} imageUrl={program.iconUrl} size="lg" />
              ) : null}
              <Badge variant={claim.consumed ? "neutral" : "mint"}>
                {formatClaimCode(claim.id)}
              </Badge>
              <CardTitle>{claim.rewardDescription}</CardTitle>
              <CardDescription>
                {program?.name ?? formatProgramCode(claim.programId)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {claimUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={buildQrImageUrl(claimUrl)}
                  alt={formatClaimCode(claim.id)}
                  className="mx-auto h-72 w-72 rounded-lg border border-[#E5E1EE] bg-white p-3 shadow-[0_14px_36px_rgba(27,23,43,0.08)]"
                />
              ) : null}

              <div className="grid gap-3 rounded-lg border border-[#E5E1EE] bg-[#FBFCFF] p-4 text-sm text-[#676078]">
                <p>
                  {dictionary.common.customer}: {formatWalletLabel(claim.user)}
                </p>
                <p>
                  {dictionary.common.date}: {formatDateTime(claim.claimedAt, locale)}
                </p>
                <p>
                  {dictionary.common.status}: {claim.consumed ? copy.usedClaim : copy.ready}
                </p>
              </div>

              {canConsume && !claim.consumed ? (
                <Button
                  icon={<BadgeCheck className="h-4 w-4" />}
                  onClick={() => void handleConsume()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? `${copy.validateClaim}...` : copy.validateClaim}
                </Button>
              ) : null}

              {claim.consumed ? (
                <StatusMessage tone="warning">{copy.usedClaim}</StatusMessage>
              ) : null}
            </CardContent>
          </Card>
        )}

        {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
        {error || connectError ? (
          <StatusMessage tone="error">{error || connectError}</StatusMessage>
        ) : null}
      </section>
    </AppChrome>
  );
}
