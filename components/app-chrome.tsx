"use client";

import { ArrowLeft, WalletCards } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { useLocale } from "./locale-provider";
import { AppAccountBar, type AppChromeWalletState } from "./app-account-bar";
import { NetworkMismatchModal } from "./network-mismatch-modal";
import { ProfileDialog } from "./profile-dialog";
import { Button } from "./ui/button";
import { EmptyState } from "./ui/empty-state";
import { StatusMessage } from "./ui/status-message";

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
  const titleId = useId();
  const descriptionId = useId();
  const shouldGateWallet = !walletState.account;

  return (
    <main
      aria-labelledby={title || shouldGateWallet ? titleId : undefined}
      className="space-y-8 pb-20 md:space-y-12 md:pb-24"
    >
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

      {shouldGateWallet ? (
        <WalletRequiredGate titleId={titleId} walletState={walletState} />
      ) : (
        <>
          {title || description || eyebrow ? (
            <section
              className="space-y-4 pb-2 md:space-y-5"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descriptionId : undefined}
            >
              {backHref ? (
                <Link
                  href={backHref}
                  className="inline-flex max-w-full flex-wrap items-center gap-2 break-words rounded-lg px-1 py-1 text-sm font-semibold text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {backLabel}
                </Link>
              ) : null}
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {eyebrow}
                </p>
              ) : null}
              <div className="min-w-0 max-w-3xl space-y-3">
                {title ? (
                  <h1
                    id={titleId}
                    className="break-words text-3xl font-semibold leading-tight text-ink md:text-5xl"
                  >
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p id={descriptionId} className="break-words text-base leading-8 text-muted">
                    {description}
                  </p>
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
        </>
      )}
    </main>
  );
}

function WalletRequiredGate({
  titleId,
  walletState
}: {
  titleId: string;
  walletState: AppChromeWalletState;
}) {
  const { dictionary } = useLocale();
  const isChecking = !walletState.hasCheckedProvider;
  const canConnect = walletState.hasCheckedProvider && walletState.hasProvider;
  const title = isChecking
    ? dictionary.account.walletCheckingTitle
    : canConnect
      ? dictionary.account.walletRequiredTitle
      : dictionary.account.noWalletTitle;
  const gateDescription = isChecking
    ? dictionary.account.walletCheckingDescription
    : canConnect
      ? dictionary.account.walletRequiredDescription
      : dictionary.account.noWalletDescription;

  return (
    <section className="mx-auto max-w-xl pt-8 md:pt-14" aria-labelledby={titleId}>
      <EmptyState
        titleId={titleId}
        title={title}
        description={gateDescription}
        icon={<WalletCards className="h-5 w-5" />}
        actions={
          canConnect || walletState.connectError ? (
            <div className="flex w-full flex-col items-start gap-3">
              {canConnect ? (
                <Button
                  icon={<WalletCards className="h-4 w-4" />}
                  onClick={() => void walletState.connect()}
                  aria-busy={walletState.isConnecting}
                  disabled={walletState.isConnecting}
                >
                  {walletState.isConnecting
                    ? `${dictionary.actions.connectWallet}...`
                    : dictionary.actions.connectWallet}
                </Button>
              ) : null}
              {walletState.connectError ? (
                <StatusMessage tone="error">{walletState.connectError}</StatusMessage>
              ) : null}
            </div>
          ) : null
        }
      />
    </section>
  );
}
