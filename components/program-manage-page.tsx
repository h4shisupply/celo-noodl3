"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAddress, isAddress, type Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { Input } from "./ui/input";
import {
  fetchClaim,
  fetchIsProgramStaff,
  fetchProgram,
  fetchProgramClaimIds,
  fetchProgramParticipants,
  fetchProgramVisitRequestIds,
  fetchProgress,
  fetchVisitRequest,
  type ClaimRecord,
  type ProgramRecord,
  type ProgressRecord,
  type VisitRequestRecord
} from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatWalletLabel } from "../lib/claim-code";
import {
  buildDynamicVisitUrl,
  buildQrImageUrl,
  buildStaticVisitUrl,
  formatClaimCode,
  formatDateTime,
  formatProgramCode,
  programCopy
} from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import {
  approveVisitRequestTx,
  consumeRewardTx,
  generateDynamicStampNonce,
  issueManualStampTx,
  rejectVisitRequestTx,
  setProgramStaffTx,
  signDynamicStampPayload,
  updateProgramTx,
  waitForTransaction
} from "../lib/wallet";

type CustomerSummary = {
  address: Hex;
  progress: ProgressRecord | null;
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
  const [program, setProgram] = useState<ProgramRecord | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [requests, setRequests] = useState<VisitRequestRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [name, setName] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [active, setActive] = useState(true);
  const [manualCustomer, setManualCustomer] = useState("");
  const [staffWallet, setStaffWallet] = useState("");
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
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
        setRequests([]);
        setCustomers([]);
        setClaims([]);
        return;
      }

      const nextCanManage = await fetchIsProgramStaff(
        programId,
        account,
        initialChainId,
        contractAddress
      );
      setCanManage(nextCanManage);

      if (!nextCanManage) {
        setRequests([]);
        setCustomers([]);
        setClaims([]);
        return;
      }

      const [requestIds, participants, claimIds] = await Promise.all([
        fetchProgramVisitRequestIds(programId, initialChainId, contractAddress),
        fetchProgramParticipants(programId, initialChainId, contractAddress),
        fetchProgramClaimIds(programId, initialChainId, contractAddress)
      ]);
      const [nextRequests, nextCustomers, nextClaims] = await Promise.all([
        Promise.all(
          requestIds.map((id) => fetchVisitRequest(id, initialChainId, contractAddress))
        ),
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

      setRequests(
        (nextRequests.filter(Boolean) as VisitRequestRecord[])
          .filter((request) => request.status === "pending")
          .sort((a, b) => b.requestedAt - a.requestedAt)
      );
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
    setRewardDescription(program.rewardDescription);
    setStampsRequired(program.stampsRequired.toString());
    setActive(program.active);
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
      const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 300);
      const { signature } = await signDynamicStampPayload({
        contractAddress,
        programId,
        nonce,
        expiresAt,
        chainId: initialChainId
      });
      setDynamicUrl(
        buildDynamicVisitUrl({
          appUrl,
          programId,
          nonce,
          expiresAt,
          signature
        })
      );
    }, copy.dynamicQrReady);
  }

  function getValidAddress(value: string) {
    const trimmed = value.trim();
    return isAddress(trimmed) ? (getAddress(trimmed) as Hex) : null;
  }

  const owner = program?.owner.toLowerCase() === account?.toLowerCase();

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
      backHref={`/app/program/${programId.toString()}`}
      backLabel={dictionary.actions.backToDashboard}
      title={program?.name ?? copy.manage}
      description={program?.rewardDescription ?? copy.appDescription}
    >
      <section className="space-y-8">
        {isLoading ? (
          <EmptyState title={dictionary.common.loading} description="" />
        ) : !program ? (
          <EmptyState title={copy.notFound} description={formatProgramCode(programId)} />
        ) : !canManage ? (
          <EmptyState title={dictionary.common.unauthorized} description={copy.connectFirst} />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              <KpiCard label={copy.pendingRequests} value={requests.length} />
              <KpiCard label={copy.customers} value={customers.length} />
              <KpiCard label={copy.rewardClaims} value={claims.length} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{copy.fixedQr}</CardTitle>
                    <CardDescription>{copy.staticQrHelp}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildQrImageUrl(staticVisitUrl)}
                      alt={copy.fixedQr}
                      className="h-64 w-64 rounded-[24px] border border-[#ECEAF4] bg-white p-3"
                    />
                    <p className="break-all text-sm text-[#625B78]">{staticVisitUrl}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.pendingRequests}</CardTitle>
                    <CardDescription>{copy.staticQrHelp}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <div
                          key={request.id.toString()}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ECEAF4] bg-[#FBFAFD] p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#18122A]">
                              {formatWalletLabel(request.customer)}
                            </p>
                            <p className="text-sm text-[#625B78]">
                              {formatDateTime(request.requestedAt, locale)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                void submitAction(async () => {
                                  if (!contractAddress) return;
                                  const hash = await approveVisitRequestTx({
                                    contractAddress,
                                    requestId: request.id,
                                    chainId: initialChainId
                                  });
                                  await waitForTransaction(hash, initialChainId);
                                }, copy.requestApproved)
                              }
                              disabled={isSubmitting}
                            >
                              {copy.approve}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void submitAction(async () => {
                                  if (!contractAddress) return;
                                  const hash = await rejectVisitRequestTx({
                                    contractAddress,
                                    requestId: request.id,
                                    chainId: initialChainId
                                  });
                                  await waitForTransaction(hash, initialChainId);
                                }, copy.requestRejected)
                              }
                              disabled={isSubmitting}
                            >
                              {copy.reject}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#625B78]">{copy.emptyCards}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{copy.customers}</CardTitle>
                    <CardDescription>{copy.issueManual}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-col gap-3 md:flex-row">
                      <Input
                        value={manualCustomer}
                        onChange={(event) => setManualCustomer(event.target.value)}
                        placeholder={copy.customerWallet}
                      />
                      <Button
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
                            className="rounded-2xl border border-[#ECEAF4] bg-[#FBFAFD] p-4"
                          >
                            <p className="mb-3 text-sm font-semibold text-[#18122A]">
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
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{copy.dynamicQr}</CardTitle>
                    <CardDescription>{copy.dynamicQrHelp}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => void handleGenerateDynamicQr()} disabled={isSubmitting || !program.active}>
                      {copy.generateDynamicQr}
                    </Button>
                    {dynamicUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={buildQrImageUrl(dynamicUrl)}
                          alt={copy.dynamicQr}
                          className="h-64 w-64 rounded-[24px] border border-[#ECEAF4] bg-white p-3"
                        />
                        <p className="break-all text-sm text-[#625B78]">{dynamicUrl}</p>
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                {owner ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{copy.staff}</CardTitle>
                      <CardDescription>{copy.staffWallet}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={staffWallet}
                        onChange={(event) => setStaffWallet(event.target.value)}
                        placeholder={copy.staffWallet}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            void submitAction(async () => {
                              const staff = getValidAddress(staffWallet);
                              if (!contractAddress || !staff) throw new Error("Invalid wallet address.");
                              const hash = await setProgramStaffTx({
                                contractAddress,
                                programId,
                                staff,
                                enabled: true,
                                chainId: initialChainId
                              });
                              await waitForTransaction(hash, initialChainId);
                            }, copy.staffUpdated)
                          }
                          disabled={isSubmitting}
                        >
                          {copy.addStaff}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void submitAction(async () => {
                              const staff = getValidAddress(staffWallet);
                              if (!contractAddress || !staff) throw new Error("Invalid wallet address.");
                              const hash = await setProgramStaffTx({
                                contractAddress,
                                programId,
                                staff,
                                enabled: false,
                                chainId: initialChainId
                              });
                              await waitForTransaction(hash, initialChainId);
                            }, copy.staffUpdated)
                          }
                          disabled={isSubmitting}
                        >
                          {copy.removeStaff}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {owner ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{copy.settings}</CardTitle>
                      <CardDescription>{copy.updateProgram}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input value={name} onChange={(event) => setName(event.target.value)} />
                      <textarea
                        value={rewardDescription}
                        onChange={(event) => setRewardDescription(event.target.value)}
                        className="min-h-[88px] w-full rounded-2xl border border-[#E4DEEF] bg-[#FBFAFD] px-4 py-3 text-sm text-[#1B1630] outline-none transition focus:border-[#B59AF2] focus:bg-white"
                      />
                      <Input
                        value={stampsRequired}
                        inputMode="numeric"
                        onChange={(event) => setStampsRequired(event.target.value)}
                      />
                      <label className="flex items-center gap-3 text-sm font-medium text-[#241B3C]">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(event) => setActive(event.target.checked)}
                        />
                        {copy.active}
                      </label>
                      <Button
                        onClick={() =>
                          void submitAction(async () => {
                            const parsedStampsRequired = Number.parseInt(stampsRequired, 10);
                            if (!contractAddress || !Number.isInteger(parsedStampsRequired)) {
                              throw new Error("Invalid settings.");
                            }
                            const hash = await updateProgramTx({
                              contractAddress,
                              programId,
                              name: name.trim(),
                              rewardDescription: rewardDescription.trim(),
                              stampsRequired: parsedStampsRequired,
                              active,
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
                ) : null}
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
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ECEAF4] bg-[#FBFAFD] p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#18122A]">
                          {formatClaimCode(claim.id)} · {formatWalletLabel(claim.user)}
                        </p>
                        <p className="text-sm text-[#625B78]">
                          {claim.consumed ? copy.usedClaim : copy.ready}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/app/claim/${claim.id.toString()}`}>
                          <Button size="sm" variant="outline">
                            {copy.openCard}
                          </Button>
                        </Link>
                        {!claim.consumed ? (
                          <Button
                            size="sm"
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
                  <p className="text-sm text-[#625B78]">{copy.emptyClaims}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {status ? <p className="text-sm text-[#2D7A46]">{status}</p> : null}
        {error || connectError ? (
          <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {error || connectError}
          </p>
        ) : null}
      </section>
    </AppChrome>
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
