"use client";

import { BadgeCheck, Gift, TicketCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { PrintableQrSheet, QrDisplay } from "./qr-display";
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
  const qrLabels = useMemo(
    () => ({
      copy: copy.qrCopy,
      copied: copy.qrCopied,
      share: copy.qrShare,
      download: copy.qrDownload,
      print: copy.qrPrint,
      open: copy.qrOpen,
      shareUnavailable: copy.qrShareUnavailable
    }),
    [copy]
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
      title={copy.claimTitle}
      description={copy.claimDescription}
    >
      <section className="mx-auto max-w-2xl space-y-6">
        {!contractAddress ? (
          <EmptyState
            title={dictionary.common.contractMissing}
            description={copy.noContract}
            icon={<Gift className="h-5 w-5" />}
          />
        ) : isLoading ? (
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
          <>
            {claimUrl ? (
              <>
                <QrDisplay
                  value={claimUrl}
                  title={claim.rewardDescription}
                  description={program?.name ?? formatProgramCode(claim.programId)}
                  code={formatClaimCode(claim.id)}
                  fileName={`noodl3-${formatClaimCode(claim.id)}-reward-ticket`}
                  labels={qrLabels}
                  showPrint
                >
                  <Badge variant={claim.consumed ? "neutral" : "mint"}>
                    {claim.consumed ? copy.ticketUsed : copy.ticketReady}
                  </Badge>
                </QrDisplay>
                <PrintableQrSheet
                  title={copy.rewardTicketSheet}
                  subtitle={program?.name ?? formatProgramCode(claim.programId)}
                  programName={claim.rewardDescription}
                  reward={`${copy.backupCode}: ${formatClaimCode(claim.id)}`}
                  rule={claim.consumed ? copy.ticketUsed : copy.ticketReady}
                  code={formatClaimCode(claim.id)}
                  value={claimUrl}
                />
              </>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>{copy.claimTitle}</CardTitle>
                <CardDescription>{copy.claimDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 rounded-lg border border-line bg-panel-soft p-4 text-sm text-muted">
                  <p dir="ltr" className="text-base font-semibold text-ink">
                    {copy.backupCode}: {formatClaimCode(claim.id)}
                  </p>
                  <p dir="ltr" className="break-all">
                    {dictionary.common.customer}: {formatWalletLabel(claim.user)}
                  </p>
                  <p>
                    {dictionary.common.date}:{" "}
                    <time dateTime={claim.claimedAt ? new Date(claim.claimedAt * 1000).toISOString() : undefined}>
                      {formatDateTime(claim.claimedAt, locale)}
                    </time>
                  </p>
                  <p>
                    {dictionary.common.status}: {claim.consumed ? copy.ticketUsed : copy.ticketReady}
                  </p>
                </div>

                {canConsume && !claim.consumed ? (
                  <Button
                    icon={<BadgeCheck className="h-4 w-4" />}
                    onClick={() => void handleConsume()}
                    aria-label={`${copy.validateClaim}: ${formatClaimCode(claim.id)}`}
                    aria-busy={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? `${copy.validateClaim}...` : copy.validateClaim}
                  </Button>
                ) : null}

                {!canConsume && !claim.consumed ? (
                  <StatusMessage tone="info">{copy.ownerValidationHint}</StatusMessage>
                ) : null}

                {claim.consumed ? (
                  <StatusMessage tone="warning">{copy.usedClaim}</StatusMessage>
                ) : null}
              </CardContent>
            </Card>
          </>
        )}

        {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
        {error || connectError ? (
          <StatusMessage tone="error">{error || connectError}</StatusMessage>
        ) : null}
      </section>
    </AppChrome>
  );
}
