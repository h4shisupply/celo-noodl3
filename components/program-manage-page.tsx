"use client";

import {
  BadgeCheck,
  Gift,
  QrCode,
  RefreshCw,
  Save,
  Send,
  Settings,
  Sparkles,
  Store,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAddress, isAddress, type Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { CountdownBadge } from "./countdown-badge";
import { ProgressMeter } from "./progress-meter";
import { PrintableQrSheet, QrDisplay } from "./qr-display";
import { useLocale } from "./locale-provider";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { MetricCard } from "./ui/metric-card";
import { StatusMessage } from "./ui/status-message";
import { Textarea } from "./ui/textarea";
import { ToggleRow } from "./ui/toggle-row";
import {
  fetchClaim,
  fetchProgram,
  fetchProgramClaimIds,
  fetchProgramParticipants,
  fetchProgress,
  type ClaimRecord,
  type ProgramRecord,
  type ProgressRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { normalizeRemoteImageUrl } from "../lib/format";
import { formatWalletLabel } from "../lib/claim-code";
import {
  buildDynamicVisitUrl,
  buildStaticVisitUrl,
  formatClaimCode,
  formatProgramCode,
  programCopy
} from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import {
  consumeRewardTx,
  generateDynamicStampNonce,
  issueManualStampTx,
  signDynamicStampPayload,
  updateProgramTx,
  waitForTransaction
} from "../lib/wallet";

type CustomerSummary = {
  address: Hex;
  progress: ProgressRecord | null;
};

type DynamicQrSession = {
  url: string;
  expiresAt: number;
};

export function ProgramManagePage({
  appUrl,
  programId,
  initialChainId,
  contractAddresses
}: {
  appUrl: string;
  programId: bigint;
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const { locale, dictionary } = useLocale();
  const copy = programCopy(locale);
  const iconUrlHelpId = "manage-program-icon-url-help";
  const [program, setProgram] = useState<ProgramRecord | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [active, setActive] = useState(true);
  const [staticStampEnabled, setStaticStampEnabled] = useState(true);
  const [manualCustomer, setManualCustomer] = useState("");
  const [dynamicQr, setDynamicQr] = useState<DynamicQrSession | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const staticVisitUrl = useMemo(
    () => buildStaticVisitUrl(appUrl, programId),
    [appUrl, programId]
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

  const loadManager = useCallback(async () => {
    if (!contractAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const nextProgram = await fetchProgram(programId, initialChainId, contractAddress);
      setProgram(nextProgram);

      if (!nextProgram || !account || isWrongChain) {
        setCanManage(false);
        setCustomers([]);
        setClaims([]);
        return;
      }

      const nextCanManage = nextProgram.owner.toLowerCase() === account.toLowerCase();
      setCanManage(nextCanManage);

      if (!nextCanManage) {
        setCustomers([]);
        setClaims([]);
        return;
      }

      const [participants, claimIds] = await Promise.all([
        fetchProgramParticipants(programId, initialChainId, contractAddress),
        fetchProgramClaimIds(programId, initialChainId, contractAddress)
      ]);
      const [nextCustomers, nextClaims] = await Promise.all([
        Promise.all(
          participants.map(async (address) => ({
            address,
            progress: await fetchProgress(address, programId, initialChainId, contractAddress)
          }))
        ),
        Promise.all(
          claimIds.map((id) => fetchClaim(id, initialChainId, contractAddress))
        )
      ]);

      setCustomers(nextCustomers);
      setClaims(
        (nextClaims.filter(Boolean) as ClaimRecord[]).sort(
          (a, b) => b.claimedAt - a.claimedAt
        )
      );
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
    void loadManager();
  }, [loadManager]);

  useEffect(() => {
    if (!program) return;
    setName(program.name);
    setIconUrl(program.iconUrl);
    setRewardDescription(program.rewardDescription);
    setStampsRequired(program.stampsRequired.toString());
    setActive(program.active);
    setStaticStampEnabled(program.staticStampEnabled);
  }, [program]);

  async function submitAction(
    action: () => Promise<void>,
    successMessage: string
  ) {
    if (!account) {
      await connect();
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setError(null);
    try {
      await action();
      setStatus(successMessage);
      await loadManager();
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateDynamicQr() {
    if (!contractAddress) {
      setError(copy.noContract);
      return;
    }

    await submitAction(async () => {
      const nonce = generateDynamicStampNonce();
      const expiresAtSeconds = Math.floor(Date.now() / 1000) + 300;
      const expiresAt = BigInt(expiresAtSeconds);
      const { signature } = await signDynamicStampPayload({
        contractAddress,
        programId,
        nonce,
        expiresAt,
        chainId: initialChainId
      });
      setDynamicQr({
        url: buildDynamicVisitUrl({
          appUrl,
          programId,
          nonce,
          expiresAt,
          signature
        }),
        expiresAt: expiresAtSeconds
      });
    }, copy.dynamicQrReady);
  }

  function getValidAddress(value: string) {
    const trimmed = value.trim();
    return isAddress(trimmed) ? (getAddress(trimmed) as Hex) : null;
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
      backHref={`/app/program/${programId.toString()}`}
      backLabel={dictionary.actions.backToDashboard}
      title={program?.name ?? copy.manage}
      description={program?.rewardDescription ?? copy.appDescription}
    >
      <section className="space-y-8">
        {!contractAddress ? (
          <EmptyState
            title={dictionary.common.contractMissing}
            description={copy.noContract}
            icon={<Store className="h-5 w-5" />}
          />
        ) : isLoading ? (
          <EmptyState
            title={dictionary.common.loading}
            description={copy.loadingProgram}
            icon={<Store className="h-5 w-5" />}
          />
        ) : !program ? (
          <EmptyState
            title={copy.notFound}
            description={formatProgramCode(programId)}
            icon={<Store className="h-5 w-5" />}
          />
        ) : !canManage ? (
          <EmptyState
            title={dictionary.common.unauthorized}
            description={copy.ownerOnly}
            icon={<Settings className="h-5 w-5" />}
          />
        ) : (
          <>
            <div className="surface-panel stamp-pattern flex flex-col gap-4 rounded-lg p-5 shadow-float sm:flex-row sm:items-center">
              <Avatar name={program.name} imageUrl={program.iconUrl} size="lg" />
              <div className="min-w-0">
                <Badge dir="ltr" variant={program.active ? "accent" : "danger"}>
                  {formatProgramCode(program.id)} {!program.active ? `· ${copy.inactive}` : ""}
                </Badge>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">
                  {program.name}
                </h1>
                <p className="text-sm leading-6 text-muted">{program.rewardDescription}</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <MetricCard icon={<Users className="h-5 w-5" />} label={copy.customers} value={customers.length} />
              <MetricCard icon={<Gift className="h-5 w-5" />} label={copy.rewardClaims} value={claims.length} tone="sun" />
              <MetricCard icon={<BadgeCheck className="h-5 w-5" />} label={copy.visitsRequired} value={program.stampsRequired} tone="accent" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <QrDisplay
                    value={staticVisitUrl}
                    title={copy.fixedQr}
                    description={copy.staticQrHelp}
                    code={formatProgramCode(program.id)}
                    fileName={`noodl3-${formatProgramCode(program.id)}-printed-qr`}
                    labels={qrLabels}
                    showPrint
                  />
                  <PrintableQrSheet
                    title={copy.fixedQr}
                    subtitle={copy.printedSheetDescription}
                    programName={program.name}
                    reward={program.rewardDescription}
                    rule={copy.staticQrRule}
                    code={formatProgramCode(program.id)}
                    value={staticVisitUrl}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.customers}</CardTitle>
                    <CardDescription>{copy.issueManual}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-col gap-3 md:flex-row">
                      <Input
                        value={manualCustomer}
                        maxLength={42}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        dir="ltr"
                        spellCheck={false}
                        aria-label={copy.customerWallet}
                        onChange={(event) => setManualCustomer(event.target.value)}
                        placeholder={copy.customerWallet}
                      />
                      <Button
                        icon={<UserPlus className="h-4 w-4" />}
                        className="w-full md:w-auto"
                        onClick={() =>
                          void submitAction(async () => {
                            const customer = getValidAddress(manualCustomer);
                            if (!contractAddress || !customer) throw new Error("Invalid wallet address.");
                            const hash = await issueManualStampTx({
                              contractAddress,
                              programId,
                              customer,
                              chainId: initialChainId
                            });
                            await waitForTransaction(hash, initialChainId);
                            setManualCustomer("");
                          }, copy.manualIssued)
                        }
                        disabled={isSubmitting}
                      >
                        {copy.issueManual}
                      </Button>
                    </div>

                    {customers.length > 0 ? (
                      <div className="grid gap-3">
                        {customers.map((customer) => (
                          <div
                            key={customer.address}
                            className="rounded-lg border border-line bg-panel-soft p-4"
                          >
                            <p dir="ltr" className="mb-3 break-all text-sm font-semibold text-ink">
                              {formatWalletLabel(customer.address)}
                            </p>
                            <ProgressMeter
                              value={customer.progress?.stamps ?? 0}
                              total={program.stampsRequired}
                              unitLabel={copy.stamps}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">{copy.emptyCards}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                <section className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-ink">{copy.dynamicQr}</h2>
                    <p className="text-sm leading-6 text-muted">{copy.dynamicQrHelp}</p>
                  </div>
                  <div className="space-y-4">
                    <Button
                      icon={dynamicQr ? <RefreshCw className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                      onClick={() => void handleGenerateDynamicQr()}
                      disabled={isSubmitting || !program.active}
                    >
                      {dynamicQr ? copy.regenerateDynamicQr : copy.generateDynamicQr}
                    </Button>
                    {!program.active ? (
                      <StatusMessage tone="warning">{copy.dynamicQrInactive}</StatusMessage>
                    ) : null}
                    {dynamicQr ? (
                      <QrDisplay
                        value={dynamicQr.url}
                        title={copy.dynamicQr}
                        description={copy.dynamicQrOneUse}
                        fileName={`noodl3-${formatProgramCode(program.id)}-live-qr`}
                        labels={qrLabels}
                      >
                        <CountdownBadge
                          expiresAt={dynamicQr.expiresAt}
                          label={copy.liveQrExpiresIn}
                          expiredLabel={copy.liveQrExpired}
                        />
                      </QrDisplay>
                    ) : (
                      <StatusMessage tone="info">{copy.dynamicQrOneUse}</StatusMessage>
                    )}
                  </div>
                </section>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.settings}</CardTitle>
                    <CardDescription>{copy.updateProgram}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label={copy.programName}>
                      <Input
                        value={name}
                        maxLength={60}
                        autoComplete="organization"
                        onChange={(event) => setName(event.target.value)}
                      />
                    </Field>
                    <Field label={copy.iconUrl} description={copy.iconUrlHelp} descriptionId={iconUrlHelpId}>
                      <Input
                        value={iconUrl}
                        type="url"
                        maxLength={280}
                        aria-describedby={iconUrlHelpId}
                        autoCapitalize="none"
                        autoCorrect="off"
                        dir="ltr"
                        inputMode="url"
                        placeholder="https://..."
                        spellCheck={false}
                        onChange={(event) => setIconUrl(event.target.value)}
                      />
                    </Field>
                    <Field label={copy.rewardDescription}>
                      <Textarea
                        value={rewardDescription}
                        maxLength={120}
                        onChange={(event) => setRewardDescription(event.target.value)}
                      />
                    </Field>
                    <Field label={copy.visitsRequired}>
                      <Input
                        value={stampsRequired}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={100}
                        step={1}
                        onChange={(event) => setStampsRequired(event.target.value)}
                      />
                    </Field>
                    <ToggleRow
                      checked={active}
                      icon={<Sparkles className="h-4 w-4" />}
                      label={copy.active}
                      description={copy.activeHelp}
                      onChange={(event) => setActive(event.target.checked)}
                    />
                    <ToggleRow
                      checked={staticStampEnabled}
                      icon={<BadgeCheck className="h-4 w-4" />}
                      label={copy.staticStampEnabled}
                      description={copy.staticStampHelp}
                      onChange={(event) => setStaticStampEnabled(event.target.checked)}
                    />
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                      onClick={() =>
                        void submitAction(async () => {
                          const parsedStampsRequired = Number.parseInt(stampsRequired, 10);
                          const normalizedIconUrl = normalizeRemoteImageUrl(iconUrl);
                          if (
                            !contractAddress ||
                            !normalizedIconUrl ||
                            !name.trim() ||
                            !rewardDescription.trim() ||
                            name.trim().length > 60 ||
                            rewardDescription.trim().length > 120 ||
                            !Number.isInteger(parsedStampsRequired) ||
                            parsedStampsRequired < 1 ||
                            parsedStampsRequired > 100
                          ) {
                            throw new Error(copy.invalidProgramConfig);
                          }
                          const hash = await updateProgramTx({
                            contractAddress,
                            programId,
                            name: name.trim(),
                            iconUrl: normalizedIconUrl,
                            rewardDescription: rewardDescription.trim(),
                            stampsRequired: parsedStampsRequired,
                            active,
                            staticStampEnabled,
                            chainId: initialChainId
                          });
                          await waitForTransaction(hash, initialChainId);
                        }, copy.settingsSaved)
                      }
                      disabled={isSubmitting}
                    >
                      {copy.updateProgram}
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{copy.rewardClaims}</CardTitle>
                <CardDescription>{copy.claimDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {claims.length > 0 ? (
                  claims.map((claim) => (
                    <div
                      key={claim.id.toString()}
                      className="flex flex-col gap-3 rounded-lg border border-line bg-panel-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-2">
                        <p dir="ltr" className="break-all text-sm font-semibold text-ink">
                          {formatClaimCode(claim.id)} · {formatWalletLabel(claim.user)}
                        </p>
                        <Badge variant={claim.consumed ? "neutral" : "mint"}>
                          {claim.consumed ? copy.usedClaim : copy.ready}
                        </Badge>
                      </div>
                      <div className="grid gap-2 sm:flex sm:flex-wrap">
                        <Link href={`/app/claim/${claim.id.toString()}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="outline" icon={<Gift className="h-4 w-4" />} className="w-full sm:w-auto">
                            {copy.openCard}
                          </Button>
                        </Link>
                        {!claim.consumed ? (
                          <Button
                            size="sm"
                            icon={<Send className="h-4 w-4" />}
                            className="w-full sm:w-auto"
                            onClick={() =>
                              void submitAction(async () => {
                                if (!contractAddress) return;
                                const hash = await consumeRewardTx({
                                  contractAddress,
                                  claimId: claim.id,
                                  chainId: initialChainId
                                });
                                await waitForTransaction(hash, initialChainId);
                              }, copy.rewardConsumed)
                            }
                            disabled={isSubmitting}
                          >
                            {copy.consume}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">{copy.emptyClaims}</p>
                )}
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
