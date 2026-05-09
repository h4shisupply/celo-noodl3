"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLocale } from "./locale-provider";
import { AppAccountBar, type AppChromeWalletState } from "./app-account-bar";
import { NetworkMismatchModal } from "./network-mismatch-modal";
import { ProfileDialog } from "./profile-dialog";

export function AppChrome({
  eyebrow,
  title,
  description,
  children,
  aside,
  walletState,
  onProfileClick,
  backHref,
  backLabel
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
  walletState: AppChromeWalletState;
  onProfileClick?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  const { dictionary } = useLocale();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main className="space-y-8 pb-20 md:space-y-12 md:pb-24">
      {walletState.account && walletState.isWrongChain ? (
        <NetworkMismatchModal
          eyebrow={dictionary.common.network}
          title={walletState.expectedChainLabel}
          description={
            walletState.isMiniPay
              ? dictionary.messages.wrongNetworkMiniPayDescription
              : dictionary.messages.wrongNetworkDescription
          }
          actionLabel={
            walletState.isMiniPay
              ? dictionary.actions.refreshNetwork
              : dictionary.actions.switchNetwork
          }
          onAction={() => {
            if (walletState.isMiniPay) {
              void walletState.refreshWalletState();
              return;
            }

            void walletState.switchToDefaultChain();
          }}
        />
      ) : null}

      <AppAccountBar
        walletState={walletState}
        onProfileClick={() => {
          onProfileClick?.();
          setProfileOpen(true);
        }}
      />

      {profileOpen && walletState.account ? (
        <ProfileDialog
          account={walletState.account}
          chainId={walletState.expectedChainId}
          contractAddress={walletState.contractAddress}
          enabled={!walletState.isWrongChain && Boolean(walletState.contractAddress)}
          onClose={() => setProfileOpen(false)}
        />
      ) : null}

      {title || description || eyebrow ? (
        <section className="space-y-4 pb-2 md:space-y-5">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-[#676078] transition hover:text-[#1B172B]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          ) : null}
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
              {eyebrow}
            </p>
          ) : null}
          <div className="max-w-3xl space-y-3">
            {title ? (
              <h1 className="text-3xl font-semibold text-[#1B172B] md:text-5xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="text-base leading-8 text-[#676078]">{description}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {aside ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_22rem]">
          {children}
          <aside>{aside}</aside>
        </div>
      ) : (
        children
      )}
    </main>
  );
}
