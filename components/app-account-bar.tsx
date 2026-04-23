"use client";

import { useEffect, useRef, useState } from "react";
import type { Hex } from "viem";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";
import { getChainLabel } from "../lib/chains";
import { getInitials } from "../lib/format";
import { interpolate } from "../lib/i18n";
import { useProfile } from "../lib/profile";
import { useLocale } from "./locale-provider";
import { formatWalletLabel } from "../lib/claim-code";

export type AppChromeWalletState = {
  account: Hex | null;
  chainId: number;
  expectedChainId: number;
  expectedChainLabel: string;
  contractAddress: Hex | null;
  hasProvider: boolean;
  isMiniPay: boolean;
  isConnecting: boolean;
  isDisconnectedByUser: boolean;
  isWrongChain: boolean;
  connect: () => Promise<Hex | null>;
  switchToDefaultChain: () => Promise<number | null>;
  refreshWalletState: () => Promise<void>;
  disconnect: () => void;
};

export function AppAccountBar({
  walletState,
  onProfileClick
}: {
  walletState: AppChromeWalletState;
  onProfileClick?: () => void;
}) {
  const { locale, dictionary } = useLocale();
  const {
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
  } = walletState;
  const { profile } = useProfile(account, expectedChainId, contractAddress, {
    enabled: !isWrongChain
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [account]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="py-5 md:py-6">
      <div className="flex items-center justify-between gap-4">
        <BrandMark href="/app" />

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {account ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E6E1F0] bg-white px-3 text-sm text-[#241B3C] shadow-[0_12px_32px_rgba(23,18,42,0.06)]"
                aria-expanded={isMenuOpen}
                aria-label={dictionary.account.openMenu}
              >
                {profile ? (
                  <>
                    <ProfileAvatar name={profile.displayName} avatarUrl={profile.avatarUrl} />
                    <span className="hidden max-w-[8rem] truncate sm:block">
                      {profile.displayName}
                    </span>
                  </>
                ) : (
                  <>
                    <WalletIcon />
                    <span className="hidden sm:block">{formatWalletLabel(account)}</span>
                  </>
                )}
                <ChevronIcon open={isMenuOpen} />
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[17rem] rounded-[28px] border border-[#E6E1F0] bg-white p-4 shadow-[0_28px_90px_rgba(23,18,42,0.12)]">
                  <div className="space-y-1 border-b border-[#F0ECF6] pb-4">
                    <p className="text-sm font-semibold text-[#18122A]">
                      {profile?.displayName ?? dictionary.account.connectedWallet}
                    </p>
                    <p className="text-sm text-[#625B78]">{formatWalletLabel(account)}</p>
                    <p className="text-sm text-[#625B78]">
                      {isWrongChain
                        ? interpolate(dictionary.account.expectedNetwork, {
                            current: getChainLabel(chainId, locale),
                            expected: expectedChainLabel
                          })
                        : getChainLabel(chainId, locale)}
                    </p>
                  </div>

                  <div className="space-y-3 py-4">
                    {isWrongChain ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (isMiniPay) {
                            void refreshWalletState();
                            return;
                          }

                          void switchToDefaultChain();
                        }}
                      >
                        {isMiniPay
                          ? dictionary.actions.refreshNetwork
                          : dictionary.actions.switchNetwork}
                      </Button>
                    ) : null}
                    {onProfileClick ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onProfileClick();
                        }}
                      >
                        {profile
                          ? dictionary.actions.editProfile
                          : dictionary.actions.addProfile}
                      </Button>
                    ) : null}
                    <div className="pt-1">
                      <LanguageSwitcher />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      disconnect();
                    }}
                  >
                    {dictionary.actions.disconnectWallet}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <LanguageSwitcher />
              {hasProvider && (!isDisconnectedByUser || !account) ? (
                <Button size="sm" onClick={() => void connect()}>
                  {isConnecting
                    ? dictionary.account.connecting
                    : dictionary.account.connect}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileAvatar({
  name,
  avatarUrl
}: {
  name: string;
  avatarUrl?: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  if (avatarUrl && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-7 w-7 rounded-full object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F3FA] text-xs font-semibold text-[#17122A]">
      {getInitials(name)}
    </span>
  );
}

function WalletIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#18122A]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8.5C4 6.57 5.57 5 7.5 5h10A2.5 2.5 0 0 1 20 7.5V9h-5.5A2.5 2.5 0 0 0 12 11.5v1A2.5 2.5 0 0 0 14.5 15H20v1.5A2.5 2.5 0 0 1 17.5 19h-10A3.5 3.5 0 0 1 4 15.5v-7Z" />
      <path d="M14 12h6" />
      <circle cx="16.5" cy="12" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 text-[#6B6482] transition ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}
