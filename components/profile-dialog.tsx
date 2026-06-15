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
  const localErrorId = "profile-dialog-error";
  const isNameInvalid = localError === dictionary.profile.nameRequired;
  const isAvatarInvalid = localError === dictionary.profile.avatarInvalid;

  useEffect(() => {
    setName(profile?.displayName ?? "");
    setAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
      id="profile-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-overlay px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
      aria-describedby="profile-dialog-description"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent"
              aria-hidden="true"
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
              onClick={onClose}
              aria-label={`${dictionary.common.close}: ${dictionary.profile.title}`}
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
          <p dir="ltr" className="rounded-lg bg-panel-soft p-3 text-sm font-medium text-muted">
            {formatWalletLabel(account)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            maxLength={40}
            name="displayName"
            aria-describedby={isNameInvalid ? localErrorId : undefined}
            aria-invalid={isNameInvalid || undefined}
            aria-label={dictionary.profile.namePlaceholder}
            autoFocus
            autoCapitalize="words"
            autoComplete="name"
            enterKeyHint="next"
            placeholder={dictionary.profile.namePlaceholder}
            required
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            value={avatarUrl}
            type="url"
            maxLength={280}
            name="avatarUrl"
            aria-describedby={isAvatarInvalid ? localErrorId : undefined}
            aria-invalid={isAvatarInvalid || undefined}
            aria-label={dictionary.profile.avatarPlaceholder}
            autoCapitalize="none"
            autoComplete="photo"
            autoCorrect="off"
            dir="ltr"
            enterKeyHint="done"
            inputMode="url"
            placeholder={dictionary.profile.avatarPlaceholder}
            spellCheck={false}
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              icon={<Save className="h-4 w-4" />}
              onClick={() => void handleSave()}
              aria-busy={isSaving}
              disabled={isSaving || profileUnavailable}
            >
              {isSaving ? dictionary.profile.saving : dictionary.actions.save}
            </Button>
            <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
              {dictionary.actions.skipForNow}
            </Button>
          </div>
          {profileUnavailable ? (
            <StatusMessage tone="warning">{dictionary.profile.unavailable}</StatusMessage>
          ) : null}
          {status ? <StatusMessage tone="success">{status}</StatusMessage> : null}
          {localError ? (
            <StatusMessage id={localErrorId} tone="error">{localError}</StatusMessage>
          ) : null}
          {profileError && !localError ? (
            <StatusMessage tone="error">{profileError}</StatusMessage>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
