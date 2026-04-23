"use client";

import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import {
  fetchProfile,
  supportsProfileFeature,
  type UserProfileRecord
} from "./contract";
import { getUserFacingErrorMessage } from "./error-message";
import { normalizeRemoteImageUrl } from "./format";
import { updateProfileTx, waitForTransaction } from "./wallet";

export type UserProfileInput = {
  name: string;
  avatarUrl?: string;
};

const PROFILE_EVENT = "noodl3-profile-updated";

type ProfileEventDetail = {
  address?: string;
  profile?: UserProfileRecord | null;
  hasSeenPrompt?: boolean;
};

function getProfileSeenKey(address: string) {
  return `noodl3_profile_seen:${address.toLowerCase()}`;
}

function dispatchProfileEvent(detail?: ProfileEventDetail) {
  window.dispatchEvent(new CustomEvent<ProfileEventDetail>(PROFILE_EVENT, { detail }));
}

function getByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export function useProfile(
  address: string | null | undefined,
  chainId: number,
  contractAddress: Hex | null,
  options?: {
    enabled?: boolean;
  }
) {
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address || typeof window === "undefined") {
      setProfile(null);
      setHasSeenPrompt(true);
      return;
    }

    setHasSeenPrompt(window.localStorage.getItem(getProfileSeenKey(address)) === "1");

    if (!contractAddress || options?.enabled === false) {
      setProfile(null);
      return;
    }

    setProfile(await fetchProfile(address as Hex, chainId, contractAddress));
  }, [address, chainId, contractAddress, options?.enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (!address || !event.key || event.key !== getProfileSeenKey(address)) {
        return;
      }

      void refresh();
    }

    function handleProfileEvent(event: Event) {
      const customEvent = event as CustomEvent<ProfileEventDetail>;
      const detail = customEvent.detail;

      if (!address) {
        void refresh();
        return;
      }

      if (detail?.address && detail.address.toLowerCase() !== address.toLowerCase()) {
        return;
      }

      if ("hasSeenPrompt" in (detail || {})) {
        setHasSeenPrompt(Boolean(detail?.hasSeenPrompt));
      }

      if ("profile" in (detail || {})) {
        setProfile(detail?.profile ?? null);
        return;
      }

      void refresh();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROFILE_EVENT, handleProfileEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROFILE_EVENT, handleProfileEvent);
    };
  }, [address, refresh]);

  const saveProfile = useCallback(
    async (nextProfile: UserProfileInput) => {
      if (!address || !contractAddress) {
        throw new Error("Profile contract unavailable.");
      }

      const displayName = nextProfile.name.trim();
      const normalizedAvatar = nextProfile.avatarUrl
        ? normalizeRemoteImageUrl(nextProfile.avatarUrl) || undefined
        : undefined;

      if (!displayName) {
        throw new Error("Display name is required.");
      }

      if (getByteLength(displayName) > 40 || getByteLength(normalizedAvatar ?? "") > 280) {
        throw new Error("Invalid profile length.");
      }

      if (nextProfile.avatarUrl && !normalizedAvatar) {
        throw new Error("Avatar URL must use https://");
      }

      const profileSupported = await supportsProfileFeature(chainId, contractAddress);
      if (!profileSupported) {
        throw new Error("Current contract does not support onchain profiles yet.");
      }

      setIsSaving(true);
      setProfileError(null);

      try {
        const txHash = await updateProfileTx({
          contractAddress,
          displayName,
          avatarUrl: normalizedAvatar ?? "",
          chainId
        });

        await waitForTransaction(txHash, chainId);

        const nextStoredProfile = {
          displayName,
          avatarUrl: normalizedAvatar,
          updatedAt: Math.floor(Date.now() / 1000),
          exists: true
        } satisfies UserProfileRecord;

        setProfile(nextStoredProfile);
        setHasSeenPrompt(true);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(getProfileSeenKey(address), "1");
        }
        dispatchProfileEvent({
          address,
          profile: nextStoredProfile,
          hasSeenPrompt: true
        });
        await refresh();

        return txHash;
      } catch (error) {
        const message = getUserFacingErrorMessage(error);
        setProfileError(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [address, chainId, contractAddress, refresh]
  );

  const dismissProfilePrompt = useCallback(() => {
    if (!address || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getProfileSeenKey(address), "1");
    setHasSeenPrompt(true);
    dispatchProfileEvent({
      address,
      hasSeenPrompt: true
    });
    void refresh();
  }, [address, refresh]);
  const clearProfileError = useCallback(() => {
    setProfileError(null);
  }, []);

  return {
    profile,
    hasSeenPrompt,
    isSaving,
    profileError,
    clearProfileError,
    saveProfile,
    dismissProfilePrompt,
    refresh
  };
}
