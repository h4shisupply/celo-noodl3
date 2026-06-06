"use client";

import { Save, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Hex } from "viem";
import { formatWalletLabel } from "../lib/claim-code";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { normalizeRemoteImageUrl } from "../lib/format";
import { useProfile } from "../lib/profile";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { StatusMessage } from "./ui/status-message";

export function ProfileDialog({
  account,
  chainId,
  contractAddress,
  enabled,
  onClose
}: {
  account: Hex;
  chainId: number;
  contractAddress: Hex | null;
  enabled: boolean;
  onClose: () => void;
}) {
  const { dictionary } = useLocale();
  const {
    profile,
    profileError,
    isSaving,
    clearProfileError,
    saveProfile,
    dismissProfilePrompt
  } = useProfile(account, chainId, contractAddress, { enabled });
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const profileUnavailable = !enabled || !contractAddress;

  useEffect(() => {
    setName(profile?.displayName ?? "");
    setAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile]);

  async function handleSave() {
    setStatus(null);
    setLocalError(null);
    clearProfileError();

    const displayName = name.trim();
    const nextAvatarUrl = avatarUrl.trim();

    if (!displayName) {
      setLocalError(dictionary.profile.nameRequired);
      return;
    }

    if (nextAvatarUrl && !normalizeRemoteImageUrl(nextAvatarUrl)) {
      setLocalError(dictionary.profile.avatarInvalid);
      return;
    }

    try {
      await saveProfile({ name: displayName, avatarUrl: nextAvatarUrl });
      setStatus(dictionary.common.saved);
    } catch (nextError) {
      setLocalError(
        getUserFacingErrorMessage(nextError, dictionary.messages.genericActionFailed)
      );
    }
  }

  function handleSkip() {
    dismissProfilePrompt();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-overlay px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
      aria-describedby="profile-dialog-description"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
              onClick={onClose}
              aria-label={dictionary.common.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div>
            <CardTitle id="profile-dialog-title">
              {dictionary.profile.title}
            </CardTitle>
            <CardDescription id="profile-dialog-description">
              {dictionary.profile.description}
            </CardDescription>
          </div>
          <p className="rounded-lg bg-panel-soft p-3 text-sm font-medium text-muted">
            {formatWalletLabel(account)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            maxLength={40}
            aria-label={dictionary.profile.namePlaceholder}
            autoComplete="name"
            placeholder={dictionary.profile.namePlaceholder}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            value={avatarUrl}
            type="url"
            maxLength={280}
            aria-label={dictionary.profile.avatarPlaceholder}
            autoComplete="photo"
            placeholder={dictionary.profile.avatarPlaceholder}
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              icon={<Save className="h-4 w-4" />}
              onClick={() => void handleSave()}
              disabled={isSaving || profileUnavailable}
            >
              {isSaving ? `${dictionary.common.saving}...` : dictionary.actions.save}
            </Button>
            <Button variant="ghost" onClick={handleSkip}>
              {dictionary.actions.skipForNow}
            </Button>
          </div>
          {profileUnavailable ? (
            <StatusMessage tone="warning">{dictionary.profile.unavailable}</StatusMessage>
          ) : null}
          {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
          {localError ? <StatusMessage tone="error">{localError}</StatusMessage> : null}
          {profileError && !localError ? (
            <StatusMessage tone="error">{profileError}</StatusMessage>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
