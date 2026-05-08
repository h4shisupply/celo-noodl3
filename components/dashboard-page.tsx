"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { QrScanner } from "./qr-scanner";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import {
  fetchClaim,
  fetchOwnerProgramIds,
  fetchPrograms,
  fetchProgress,
  fetchStaffProgramIds,
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
  role: "owner" | "staff" | "customer";
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
      const [ownerIds, staffIds, userIds, claimIds] = await Promise.all([
        fetchOwnerProgramIds(account, initialChainId, contractAddress),
        fetchStaffProgramIds(account, initialChainId, contractAddress),
        fetchUserProgramIds(account, initialChainId, contractAddress),
        fetchUserClaimIds(account, initialChainId, contractAddress)
      ]);
      const ownerSet = new Set(ownerIds.map((id) => id.toString()));
      const staffSet = new Set(staffIds.map((id) => id.toString()));
      const userSet = new Set(userIds.map((id) => id.toString()));
      const allProgramIds = [...new Set([...ownerIds, ...staffIds, ...userIds].map(String))].map(BigInt);
      const nextPrograms = await fetchPrograms(allProgramIds, initialChainId, contractAddress);
      const dashboardPrograms = await Promise.all(
        nextPrograms.map(async (program) => {
          const progress = userSet.has(program.id.toString())
            ? await fetchProgress(account, program.id, initialChainId, contractAddress)
            : null;
          const role = ownerSet.has(program.id.toString())
            ? "owner"
            : staffSet.has(program.id.toString())
              ? "staff"
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

    setNotice("QR code is not a Noodl3 program link.");
    return false;
  }

  const customerPrograms = programs.filter((program) => program.progress);
  const managedPrograms = programs.filter(
    (program) => program.role === "owner" || program.role === "staff"
  );
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
        isMiniPay,
        isConnecting,
        isDisconnectedByUser,
        isWrongChain,
        connect,
        switchToDefaultChain,
        refreshWalletState,
        disconnect
      }}
      title={copy.appTitle}
      description={copy.appDescription}
    >
      <section className="space-y-8">
        {connectError || error ? (
          <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {connectError || error}
          </p>
        ) : null}

        {!contractAddress ? (
          <EmptyState title={dictionary.common.contractMissing} description={copy.noContract} />
        ) : null}

        {!account ? (
          <EmptyState
            title={copy.connectFirst}
            description={copy.appDescription}
            actions={
              hasProvider ? (
                <Button onClick={() => void connect()}>
                  {isConnecting ? `${dictionary.actions.connectWallet}...` : dictionary.actions.connectWallet}
                </Button>
              ) : null
            }
          />
        ) : null}

        {account && contractAddress ? (
          <>
            <div className="flex flex-wrap gap-3">
              <Link href="/app/program/new">
                <Button>{copy.createProgram}</Button>
              </Link>
              <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                {copy.scanQr}
              </Button>
              <Button variant="ghost" onClick={() => void loadDashboard()}>
                {isLoading ? `${dictionary.common.loading}...` : dictionary.actions.refreshNetwork}
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <KpiCard label={copy.myCards} value={customerPrograms.length} />
              <KpiCard label={copy.myPrograms} value={managedPrograms.length} />
              <KpiCard label={copy.rewardClaims} value={pendingClaims.length} />
            </div>

            <DashboardSection title={copy.myCards}>
              {customerPrograms.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {customerPrograms.map((program) => (
                    <ProgramCard key={program.id.toString()} program={program} />
                  ))}
                </div>
              ) : (
                <EmptyState title={copy.myCards} description={copy.emptyCards} />
              )}
            </DashboardSection>

            <DashboardSection title={copy.myPrograms}>
              {managedPrograms.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {managedPrograms.map((program) => (
                    <ManagedProgramCard key={program.id.toString()} program={program} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={copy.myPrograms}
                  description={copy.emptyPrograms}
                  actions={
                    <Link href="/app/program/new">
                      <Button size="sm">{copy.createProgram}</Button>
                    </Link>
                  }
                />
              )}
            </DashboardSection>

            <DashboardSection title={copy.rewardClaims}>
              {claims.length > 0 ? (
                <div className="grid gap-4">
                  {claims.map((claim) => (
                    <ClaimSummaryCard key={claim.id.toString()} claim={claim} />
                  ))}
                </div>
              ) : (
                <EmptyState title={copy.rewardClaims} description={copy.emptyClaims} />
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
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-[#18122A]">{title}</h2>
      {children}
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
          {label}
        </p>
        <p className="text-3xl font-semibold text-[#18122A]">{value}</p>
      </CardContent>
    </Card>
  );
}

function ProgramCard({ program }: { program: DashboardProgram }) {
  const { locale } = useLocale();
  const copy = programCopy(locale);
  const progress = program.progress;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
          {formatProgramCode(program.id)}
        </p>
        <CardTitle>{program.name}</CardTitle>
        <CardDescription>{program.rewardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProgressMeter
          value={progress?.stamps ?? 0}
          total={program.stampsRequired}
          unitLabel={copy.stamps}
        />
        <div className="flex flex-wrap gap-3">
          <Link href={`/app/program/${program.id.toString()}`}>
            <Button size="sm">{copy.openCard}</Button>
          </Link>
          {progress?.canClaim ? (
            <span className="rounded-full bg-[#EAF7EF] px-3 py-2 text-sm font-medium text-[#2D7A46]">
              {copy.ready}
            </span>
          ) : (
            <span className="rounded-full bg-[#F5F3FA] px-3 py-2 text-sm font-medium text-[#625B78]">
              {copy.collecting}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ManagedProgramCard({ program }: { program: DashboardProgram }) {
  const { locale } = useLocale();
  const copy = programCopy(locale);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
          {program.role === "owner" ? "Owner" : "Staff"} · {formatProgramCode(program.id)}
        </p>
        <CardTitle>{program.name}</CardTitle>
        <CardDescription>{program.rewardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#625B78]">
          {program.stampsRequired} {copy.visits}
          {!program.active ? ` · ${copy.inactive}` : ""}
        </p>
        <Link href={`/app/program/${program.id.toString()}/manage`}>
          <Button size="sm" variant="outline">
            {copy.manage}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function ClaimSummaryCard({ claim }: { claim: ClaimRecord }) {
  const { locale } = useLocale();
  const copy = programCopy(locale);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#18122A]">
            {formatClaimCode(claim.id)} · {claim.rewardDescription}
          </p>
          <p className="text-sm text-[#625B78]">
            {formatProgramCode(claim.programId)} · {formatDateTime(claim.claimedAt, locale)}
          </p>
          <p className="text-sm text-[#625B78]">{formatWalletLabel(claim.user)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#F5F3FA] px-3 py-2 text-sm font-medium text-[#625B78]">
            {claim.consumed ? copy.usedClaim : copy.ready}
          </span>
          <Link href={`/app/claim/${claim.id.toString()}`}>
            <Button size="sm" variant="outline">
              {copy.openCard}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
