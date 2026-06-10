"use client";

import {
  BadgeCheck,
  Gift,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  Store,
  TicketCheck,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { QrScanner } from "./qr-scanner";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { MetricCard } from "./ui/metric-card";
import { StatusMessage } from "./ui/status-message";
import {
  fetchClaim,
  fetchOwnerProgramIds,
  fetchPrograms,
  fetchProgress,
  fetchUserClaimIds,
  fetchUserProgramIds,
  type ClaimRecord,
  type ProgramRecord,
  type ProgressRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatWalletLabel } from "../lib/claim-code";
import {
  formatClaimCode,
  formatDateTime,
  formatProgramCode,
  parseProgramUrl,
  programCopy
} from "../lib/program";
import { useMiniPay } from "../lib/minipay";

type DashboardProgram = ProgramRecord & {
  progress?: ProgressRecord | null;
  role: "owner" | "customer";
};

export function DashboardPage({
  initialChainId,
  contractAddresses
}: {
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const copy = programCopy(locale);
  const [programs, setPrograms] = useState<DashboardProgram[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const loadDashboard = useCallback(async () => {
    if (!account || !contractAddress || isWrongChain) {
      setPrograms([]);
      setClaims([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [ownerIds, userIds, claimIds] = await Promise.all([
        fetchOwnerProgramIds(account, initialChainId, contractAddress),
        fetchUserProgramIds(account, initialChainId, contractAddress),
        fetchUserClaimIds(account, initialChainId, contractAddress)
      ]);
      const ownerSet = new Set(ownerIds.map((id) => id.toString()));
      const userSet = new Set(userIds.map((id) => id.toString()));
      const allProgramIds = [...new Set([...ownerIds, ...userIds].map(String))].map(BigInt);
      const nextPrograms = await fetchPrograms(allProgramIds, initialChainId, contractAddress);
      const dashboardPrograms = await Promise.all(
        nextPrograms.map(async (program) => {
          const progress = userSet.has(program.id.toString())
            ? await fetchProgress(account, program.id, initialChainId, contractAddress)
            : null;
          const role = ownerSet.has(program.id.toString())
            ? "owner"
            : "customer";

          return {
            ...program,
            progress,
            role
          } satisfies DashboardProgram;
        })
      );
      const nextClaims = (
        await Promise.all(
          claimIds.map((id) => fetchClaim(id, initialChainId, contractAddress))
        )
      ).filter(Boolean) as ClaimRecord[];

      setPrograms(dashboardPrograms);
      setClaims(nextClaims);
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
    isWrongChain
  ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  function handleQrDetected(value: string) {
    try {
      const url = new URL(value, window.location.origin);
      if (url.pathname.startsWith("/app/program/")) {
        router.push(`${url.pathname}${url.search}`);
        return;
      }
    } catch {
      // Fall through to permissive program parsing.
    }

    const programId = parseProgramUrl(value);
    if (programId) {
      router.push(`/app/program/${programId.toString()}`);
      return;
    }

    setNotice(copy.invalidProgramQr);
    return false;
  }

  const customerPrograms = programs.filter((program) => program.progress);
  const managedPrograms = programs.filter((program) => program.role === "owner");
  const pendingClaims = claims.filter((claim) => !claim.consumed);

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
      title={copy.appTitle}
      description={copy.appDescription}
    >
      <section className="space-y-9">
        {connectError || error ? (
          <StatusMessage tone="error">{connectError || error}</StatusMessage>
        ) : null}

        {!contractAddress ? (
          <EmptyState
            title={dictionary.common.contractMissing}
            description={copy.noContract}
            icon={<Store className="h-5 w-5" />}
          />
        ) : null}

        {!account ? (
          <EmptyState
            title={copy.connectFirst}
            description={copy.appDescription}
            icon={<WalletCards className="h-5 w-5" />}
            actions={
              hasProvider ? (
                <Button
                  icon={<WalletCards className="h-4 w-4" />}
                  onClick={() => void connect()}
                  aria-busy={isConnecting}
                  disabled={isConnecting}
                >
                  {isConnecting ? `${dictionary.actions.connectWallet}...` : dictionary.actions.connectWallet}
                </Button>
              ) : null
            }
          />
        ) : null}

        {account && contractAddress ? (
          <>
            <div className="surface-panel flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Link
                href="/app/program/new"
                className="inline-flex min-h-11 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,23,43,0.18)] transition duration-200 hover:bg-ink-hover hover:shadow-[0_16px_34px_rgba(27,23,43,0.22)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="min-w-0 whitespace-normal text-center leading-tight">
                  {copy.createProgram}
                </span>
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  variant="warm"
                  icon={<QrCode className="h-4 w-4" />}
                  className="w-full sm:w-auto"
                  aria-haspopup="dialog"
                  aria-controls="qr-scanner-dialog"
                  aria-expanded={isScannerOpen}
                  onClick={() => setIsScannerOpen(true)}
                >
                  {copy.scanQr}
                </Button>
                <Button
                  variant="ghost"
                  icon={<RefreshCw className="h-4 w-4" />}
                  className="w-full sm:w-auto"
                  aria-busy={isLoading}
                  disabled={isLoading}
                  onClick={() => void loadDashboard()}
                >
                  {isLoading ? `${dictionary.common.loading}...` : dictionary.actions.refreshNetwork}
                </Button>
              </div>
            </div>

            <ul className="grid gap-5 md:grid-cols-3">
              <li>
                <MetricCard
                  icon={<WalletCards className="h-5 w-5" />}
                  label={copy.myCards}
                  value={customerPrograms.length}
                />
              </li>
              <li>
                <MetricCard
                  icon={<Store className="h-5 w-5" />}
                  label={copy.myPrograms}
                  value={managedPrograms.length}
                  tone="accent"
                />
              </li>
              <li>
                <MetricCard
                  icon={<Gift className="h-5 w-5" />}
                  label={copy.rewardClaims}
                  value={pendingClaims.length}
                  tone="sun"
                />
              </li>
            </ul>

            <DashboardSection title={copy.myCards}>
              {customerPrograms.length > 0 ? (
                <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {customerPrograms.map((program) => (
                    <li key={program.id.toString()}>
                      <ProgramCard program={program} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={copy.myCards}
                  description={copy.emptyCards}
                  icon={<ScanLine className="h-5 w-5" />}
                />
              )}
            </DashboardSection>

            <DashboardSection title={copy.myPrograms}>
              {managedPrograms.length > 0 ? (
                <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {managedPrograms.map((program) => (
                    <li key={program.id.toString()}>
                      <ManagedProgramCard program={program} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={copy.myPrograms}
                  description={copy.emptyPrograms}
                  icon={<Store className="h-5 w-5" />}
                  actions={
                    <Link
                      href="/app/program/new"
                      className="inline-flex min-h-9 max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-ink px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,23,43,0.18)] transition duration-200 hover:bg-ink-hover hover:shadow-[0_16px_34px_rgba(27,23,43,0.22)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
                    >
                      <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
                        <Plus className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 whitespace-normal text-center leading-tight">
                        {copy.createProgram}
                      </span>
                    </Link>
                  }
                />
              )}
            </DashboardSection>

            <DashboardSection title={copy.rewardClaims}>
              {claims.length > 0 ? (
                <ul className="grid gap-4">
                  {claims.map((claim) => (
                    <li key={claim.id.toString()}>
                      <ClaimSummaryCard claim={claim} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={copy.rewardClaims}
                  description={copy.emptyClaims}
                  icon={<TicketCheck className="h-5 w-5" />}
                />
              )}
            </DashboardSection>
          </>
        ) : null}

        {isScannerOpen ? (
          <QrScanner
            title={copy.scanQr}
            description={copy.appDescription}
            notice={notice}
            onClose={() => {
              setNotice(null);
              setIsScannerOpen(false);
            }}
            onDetected={handleQrDetected}
          />
        ) : null}
      </section>
    </AppChrome>
  );
}

function DashboardSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 id={titleId} className="text-xl font-semibold text-ink">
          {title}
        </h2>
        <div className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

function ProgramCard({ program }: { program: DashboardProgram }) {
  const { locale } = useLocale();
  const copy = programCopy(locale);
  const progress = program.progress;
  const titleId = useId();

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-float"
    >
      <CardHeader className="space-y-3">
        <Avatar name={program.name} imageUrl={program.iconUrl} size="sm" />
        <p dir="ltr" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {formatProgramCode(program.id)}
        </p>
        <CardTitle id={titleId}>{program.name}</CardTitle>
        <CardDescription>{program.rewardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProgressMeter
          value={progress?.stamps ?? 0}
          total={program.stampsRequired}
          unitLabel={copy.stamps}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={`/app/program/${program.id.toString()}`}
            aria-label={`${copy.openCard}: ${program.name}`}
            className="inline-flex min-h-9 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-ink px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,23,43,0.18)] transition duration-200 hover:bg-ink-hover hover:shadow-[0_16px_34px_rgba(27,23,43,0.22)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <span className="min-w-0 whitespace-normal text-center leading-tight">
              {copy.openCard}
            </span>
          </Link>
          {progress?.canClaim ? (
            <Badge variant="mint">{copy.ready}</Badge>
          ) : (
            <Badge variant="neutral">{copy.collecting}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ManagedProgramCard({ program }: { program: DashboardProgram }) {
  const { locale, dictionary } = useLocale();
  const copy = programCopy(locale);
  const titleId = useId();

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-float"
    >
      <CardHeader className="space-y-3">
        <Avatar name={program.name} imageUrl={program.iconUrl} size="sm" />
        <Badge dir="ltr" variant={program.active ? "accent" : "danger"}>
          {dictionary.common.manager} · {formatProgramCode(program.id)}
        </Badge>
        <CardTitle id={titleId}>{program.name}</CardTitle>
        <CardDescription>{program.rewardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">
          {program.stampsRequired} {copy.visits}
          {!program.active ? ` · ${copy.inactive}` : ""}
        </p>
        <Link
          href={`/app/program/${program.id.toString()}/manage`}
          aria-label={`${copy.manage}: ${program.name}`}
          className="inline-flex min-h-9 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-ink-soft shadow-[0_8px_24px_rgba(27,23,43,0.045)] transition duration-200 hover:border-accent-border hover:bg-accent-soft active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
        >
          <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
            <Store className="h-4 w-4" />
          </span>
          <span className="min-w-0 whitespace-normal text-center leading-tight">
            {copy.manage}
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}

function ClaimSummaryCard({ claim }: { claim: ClaimRecord }) {
  const { locale } = useLocale();
  const copy = programCopy(locale);
  const titleId = useId();

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="transition duration-200 hover:shadow-float"
    >
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p id={titleId} dir="ltr" className="break-words text-sm font-semibold text-ink">
            {formatClaimCode(claim.id)} · {claim.rewardDescription}
          </p>
          <p dir="ltr" className="text-sm text-muted">
            {formatProgramCode(claim.programId)} ·{" "}
            <time dateTime={claim.claimedAt ? new Date(claim.claimedAt * 1000).toISOString() : undefined}>
              {formatDateTime(claim.claimedAt, locale)}
            </time>
          </p>
          <p dir="ltr" className="text-sm text-muted">{formatWalletLabel(claim.user)}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Badge variant={claim.consumed ? "neutral" : "mint"}>
            {claim.consumed ? copy.usedClaim : copy.ready}
          </Badge>
          <Link
            href={`/app/claim/${claim.id.toString()}`}
            aria-label={`${copy.openCard}: ${claim.rewardDescription}`}
            className="inline-flex min-h-9 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-ink-soft shadow-[0_8px_24px_rgba(27,23,43,0.045)] transition duration-200 hover:border-accent-border hover:bg-accent-soft active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
              <Gift className="h-4 w-4" />
            </span>
            <span className="min-w-0 whitespace-normal text-center leading-tight">
              {copy.openCard}
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
