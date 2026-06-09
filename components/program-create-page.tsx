"use client";

import { BadgeCheck, Gift, Image as ImageIcon, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Field } from "./ui/field";
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
  const iconUrlHelpId = "program-icon-url-help";
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
      title={copy.createTitle}
      description={copy.createDescription}
    >
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Card className="shadow-float">
          <CardHeader>
            <CardTitle>{copy.createProgram}</CardTitle>
            <CardDescription>{copy.createDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!contractAddress ? (
              <StatusMessage tone="warning">{copy.noContract}</StatusMessage>
            ) : null}
            <Field label={copy.programName}>
              <Input
                value={name}
                maxLength={60}
                autoComplete="organization"
                enterKeyHint="next"
                placeholder={copy.programNamePlaceholder}
                required
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
                autoComplete="url"
                autoCorrect="off"
                dir="ltr"
                enterKeyHint="next"
                inputMode="url"
                placeholder="https://..."
                required
                spellCheck={false}
                onChange={(event) => setIconUrl(event.target.value)}
              />
            </Field>
            <Field label={copy.rewardDescription}>
              <Textarea
                value={rewardDescription}
                autoComplete="off"
                enterKeyHint="done"
                maxLength={120}
                placeholder={copy.rewardPlaceholder}
                required
                onChange={(event) => setRewardDescription(event.target.value)}
              />
            </Field>
            <Field label={copy.visitsRequired}>
              <Input
                value={stampsRequired}
                type="number"
                autoComplete="off"
                enterKeyHint="done"
                inputMode="numeric"
                min={1}
                max={100}
                required
                step={1}
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
              aria-busy={isSaving}
              disabled={isSaving || !contractAddress}
              className="w-full sm:w-auto"
            >
              {isSaving ? `${dictionary.common.saving}...` : copy.saveProgram}
            </Button>

            {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
            {error || connectError ? (
              <StatusMessage tone="error">{error || connectError}</StatusMessage>
            ) : null}
          </CardContent>
        </Card>

        <aside className="surface-panel stamp-pattern h-fit rounded-lg p-3 lg:sticky lg:top-6">
          <div className="space-y-5 rounded-lg bg-panel p-5 shadow-[inset_0_0_0_1px_rgba(221,216,233,0.72)]">
            <div className="flex items-center gap-3">
              {normalizeRemoteImageUrl(iconUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeRemoteImageUrl(iconUrl) ?? ""}
                  alt=""
                  width={48}
                  height={48}
                  aria-hidden="true"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-lg border border-line object-cover"
                />
              ) : (
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent"
                  aria-hidden="true"
                >
                  <ImageIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {name || copy.previewProgramName}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {copy.previewCard}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2" aria-hidden="true">
              {Array.from({
                length: Math.max(1, Math.min(Number.parseInt(stampsRequired, 10) || 10, 10))
              }).map((_, index) => (
                <span
                  key={index}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold ${
                    index < 3
                      ? "border-mint bg-mint-soft text-mint-strong"
                      : "border-line bg-panel text-muted-soft"
                  }`}
                >
                  {index + 1}
                </span>
              ))}
            </div>

            <div className="break-words rounded-lg border border-sun-border bg-sun-soft p-3 text-sm font-semibold leading-6 text-sun-strong">
              <Gift className="mb-2 h-4 w-4" aria-hidden="true" />
              {rewardDescription || copy.previewReward}
            </div>
          </div>
        </aside>
      </section>
    </AppChrome>
  );
}
