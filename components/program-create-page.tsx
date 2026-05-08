"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { normalizeRemoteImageUrl } from "../lib/format";
import { programCopy } from "../lib/program";
import { useMiniPay } from "../lib/minipay";
import {
  createProgramTx,
  extractProgramIdFromReceipt,
  waitForTransaction
} from "../lib/wallet";

export function ProgramCreatePage({
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
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [active, setActive] = useState(true);
  const [staticStampEnabled, setStaticStampEnabled] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  async function handleSubmit() {
    if (!account) {
      await connect();
      return;
    }
    if (!contractAddress) {
      setError(copy.noContract);
      return;
    }

    const parsedStampsRequired = Number.parseInt(stampsRequired, 10);
    const normalizedIconUrl = normalizeRemoteImageUrl(iconUrl);
    if (
      !name.trim() ||
      !normalizedIconUrl ||
      !rewardDescription.trim() ||
      name.trim().length > 60 ||
      rewardDescription.trim().length > 120 ||
      !Number.isInteger(parsedStampsRequired) ||
      parsedStampsRequired < 1 ||
      parsedStampsRequired > 100
    ) {
      setError(copy.invalidProgramConfig);
      return;
    }

    setIsSaving(true);
    setStatus(null);
    setError(null);
    try {
      const hash = await createProgramTx({
        contractAddress,
        name: name.trim(),
        iconUrl: normalizedIconUrl,
        rewardDescription: rewardDescription.trim(),
        stampsRequired: parsedStampsRequired,
        active,
        staticStampEnabled,
        chainId: initialChainId
      });
      const receipt = await waitForTransaction(hash, initialChainId);
      const programId = extractProgramIdFromReceipt(receipt);
      setStatus(copy.programCreated);
      router.push(programId ? `/app/program/${programId.toString()}/manage` : "/app");
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed));
    } finally {
      setIsSaving(false);
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
      title={copy.createTitle}
      description={copy.createDescription}
    >
      <section className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{copy.createProgram}</CardTitle>
            <CardDescription>{copy.createDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label={copy.programName}>
              <Input value={name} maxLength={60} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label={copy.iconUrl}>
              <Input
                value={iconUrl}
                maxLength={280}
                placeholder="https://..."
                onChange={(event) => setIconUrl(event.target.value)}
              />
              <p className="text-xs text-[#8B84A1]">{copy.iconUrlHelp}</p>
            </Field>
            <Field label={copy.rewardDescription}>
              <textarea
                value={rewardDescription}
                maxLength={120}
                onChange={(event) => setRewardDescription(event.target.value)}
                className="min-h-[96px] w-full rounded-2xl border border-[#E4DEEF] bg-[#FBFAFD] px-4 py-3 text-sm text-[#1B1630] outline-none transition placeholder:text-[#9A95AD] focus:border-[#B59AF2] focus:bg-white"
              />
            </Field>
            <Field label={copy.visitsRequired}>
              <Input
                value={stampsRequired}
                inputMode="numeric"
                onChange={(event) => setStampsRequired(event.target.value)}
              />
            </Field>
            <label className="flex items-center gap-3 text-sm font-medium text-[#241B3C]">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              {copy.active}
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-[#241B3C]">
              <input
                type="checkbox"
                checked={staticStampEnabled}
                onChange={(event) => setStaticStampEnabled(event.target.checked)}
              />
              {copy.staticStampEnabled}
            </label>

            <Button onClick={() => void handleSubmit()} disabled={isSaving || !contractAddress}>
              {isSaving ? `${dictionary.common.saving}...` : copy.saveProgram}
            </Button>

            {status ? <p className="text-sm text-[#2D7A46]">{status}</p> : null}
            {error || connectError ? (
              <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
                {error || connectError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppChrome>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
        {label}
      </span>
      {children}
    </label>
  );
}
