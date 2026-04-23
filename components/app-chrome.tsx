"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "./locale-provider";
import { AppAccountBar, type AppChromeWalletState } from "./app-account-bar";
import { NetworkMismatchModal } from "./network-mismatch-modal";

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
  const { locale, dictionary } = useLocale();

  return (
    <main className="space-y-10 pb-20 md:space-y-14 md:pb-24">
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

      <AppAccountBar walletState={walletState} onProfileClick={onProfileClick} />

      {title || description || eyebrow ? (
        <section className="space-y-4 pb-2 md:space-y-5">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#625B78] transition hover:text-[#18122A]"
            >
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>
          ) : null}
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7B3FE4]">
              {eyebrow}
            </p>
          ) : null}
          <div className="max-w-3xl space-y-3">
            {title ? (
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-5xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="text-base leading-8 text-[#625B78]">{description}</p>
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
