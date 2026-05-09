"use client";

import { BadgeCheck, Gift, Image as ImageIcon, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { StatusMessage } from "./ui/status-message";
import { Textarea } from "./ui/textarea";
import { ToggleRow } from "./ui/toggle-row";
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
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>{copy.createProgram}</CardTitle>
            <CardDescription>{copy.createDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label={copy.programName}>
              <Input
                value={name}
                maxLength={60}
                placeholder={copy.programNamePlaceholder}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label={copy.iconUrl}>
              <Input
                value={iconUrl}
                maxLength={280}
                placeholder="https://..."
                onChange={(event) => setIconUrl(event.target.value)}
              />
              <p className="text-xs text-[#676078]">{copy.iconUrlHelp}</p>
            </Field>
            <Field label={copy.rewardDescription}>
              <Textarea
                value={rewardDescription}
                maxLength={120}
                placeholder={copy.rewardPlaceholder}
                onChange={(event) => setRewardDescription(event.target.value)}
              />
            </Field>
            <Field label={copy.visitsRequired}>
              <Input
                value={stampsRequired}
                inputMode="numeric"
                onChange={(event) => setStampsRequired(event.target.value)}
              />
            </Field>

            <div className="grid gap-3">
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
            </div>

            <Button
              icon={<Save className="h-4 w-4" />}
              onClick={() => void handleSubmit()}
              disabled={isSaving || !contractAddress}
            >
              {isSaving ? `${dictionary.common.saving}...` : copy.saveProgram}
            </Button>

            {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
            {error || connectError ? (
              <StatusMessage tone="error">{error || connectError}</StatusMessage>
            ) : null}
          </CardContent>
        </Card>

        <aside className="surface-panel stamp-pattern h-fit rounded-lg p-5">
          <div className="space-y-5 rounded-lg bg-white/88 p-5">
            <div className="flex items-center gap-3">
              {normalizeRemoteImageUrl(iconUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeRemoteImageUrl(iconUrl) ?? ""}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3EFFF] text-[#7047DF]">
                  <ImageIcon className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1B172B]">
                  {name || copy.previewProgramName}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#676078]">
                  {copy.previewCard}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({
                length: Math.max(1, Math.min(Number.parseInt(stampsRequired, 10) || 10, 10))
              }).map((_, index) => (
                <span
                  key={index}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold ${
                    index < 3
                      ? "border-[#0F9F8F] bg-[#E9FBF7] text-[#146B5E]"
                      : "border-[#DCD6EA] bg-white text-[#8B84A1]"
                  }`}
                >
                  {index + 1}
                </span>
              ))}
            </div>

            <div className="rounded-lg bg-[#FFF7E8] p-3 text-sm font-semibold leading-6 text-[#8B5B00]">
              <Gift className="mb-2 h-4 w-4" aria-hidden="true" />
              {rewardDescription || copy.previewReward}
            </div>
          </div>
        </aside>
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
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#676078]">
        {label}
      </span>
      {children}
    </label>
  );
}
