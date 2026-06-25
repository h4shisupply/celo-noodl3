"use client";

import { ChevronDown, LogOut, RefreshCw, UserRound, Wallet } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
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
  hasCheckedProvider: boolean;
  isMiniPay: boolean;
  isConnecting: boolean;
  isDisconnectedByUser: boolean;
  isWrongChain: boolean;
  connectError?: string | null;
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
    hasCheckedProvider,
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
  const accountMenuId = useId();
  const accountMenuLabel = isMenuOpen
    ? dictionary.account.closeMenu
    : dictionary.account.openMenu;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [account]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header
      className="py-5 md:py-6"
      aria-label={account ? dictionary.account.connectedWallet : undefined}
    >
      <div className="flex items-center justify-between gap-4">
        <BrandMark href="/app" ariaLabel={`${dictionary.brand.name}: ${dictionary.nav.app}`} />

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {account ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="inline-flex h-11 max-w-[13rem] items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold text-ink-soft shadow-card transition hover:border-accent-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:max-w-none"
                aria-controls={accountMenuId}
                aria-expanded={isMenuOpen}
                aria-haspopup="dialog"
                aria-label={accountMenuLabel}
                title={accountMenuLabel}
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
                    <Wallet className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
                    <span dir="ltr" title={account} className="hidden sm:block">{formatWalletLabel(account)}</span>
                  </>
                )}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition ${isMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isMenuOpen ? (
                <div
                  id={accountMenuId}
                  role="dialog"
                  aria-label={dictionary.account.connectedWallet}
                  aria-describedby={`${accountMenuId}-summary`}
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(17rem,calc(100vw-2rem))] rounded-lg border border-line bg-panel p-4 shadow-float"
                >
                  <div id={`${accountMenuId}-summary`} className="space-y-1 border-b border-line-soft pb-4">
                    <p className="break-words text-sm font-semibold text-ink">
                      {profile?.displayName ?? dictionary.account.connectedWallet}
                    </p>
                    <p dir="ltr" title={account} className="break-all text-sm text-muted">
                      <span className="sr-only">{account}</span>
                      <span aria-hidden="true">{formatWalletLabel(account)}</span>
                    </p>
                    <p className="break-words text-sm text-muted">
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
                        icon={<RefreshCw className="h-4 w-4" />}
                        title={isMiniPay ? dictionary.actions.refreshNetwork : dictionary.actions.switchNetwork}
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
                        icon={<UserRound className="h-4 w-4" />}
                        aria-haspopup="dialog"
                        aria-controls="profile-dialog"
                        title={profile ? dictionary.actions.editProfile : dictionary.actions.addProfile}
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
                    icon={<LogOut className="h-4 w-4" />}
                    title={dictionary.actions.disconnectWallet}
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
              {hasCheckedProvider && hasProvider && (!isDisconnectedByUser || !account) ? (
                <Button
                  size="sm"
                  title={isConnecting ? dictionary.account.connecting : dictionary.account.connect}
                  onClick={() => void connect()}
                  aria-busy={isConnecting}
                  disabled={isConnecting}
                >
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
        alt=""
        width={28}
        height={28}
        aria-hidden="true"
        decoding="async"
        draggable={false}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-7 w-7 shrink-0 rounded-full object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-mint-soft text-xs font-semibold text-mint-strong"
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
