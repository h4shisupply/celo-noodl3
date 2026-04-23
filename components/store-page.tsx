"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits, type Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { StoreLogo } from "./store-logo";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HeadlessSelect } from "./ui/headless-select";
import {
  buildRewardCopy,
  buildStampRuleCopy,
  findItemById,
  formatPaymentAmount,
  resolveText,
  type StoreCatalogEntry
} from "../lib/catalog";
import { formatWalletLabel } from "../lib/claim-code";
import { buildDashboardUrl } from "../lib/dashboard-route";
import { fetchProgress, fetchStore, fetchStoreAcceptedTokens } from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { useMiniPay } from "../lib/minipay";
import { encodeStoreId } from "../lib/store-id";
import { getPrimaryPaymentToken, getTokenByAddress, type SupportedToken } from "../lib/tokens";
import { useAutoDismissMessage } from "../lib/use-auto-dismiss-message";
import {
  approveToken,
  purchaseTx,
  readAllowance,
  readBalance,
  waitForTransaction
} from "../lib/wallet";

export function StorePage({
  store,
  initialItemId,
  openedFromQr,
  initialChainId,
  contractAddresses
}: {
  store: StoreCatalogEntry;
  initialItemId?: string;
  openedFromQr: boolean;
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const [selectedItemId, setSelectedItemId] = useState(
    findItemById(store, initialItemId)?.id ?? store.menu[0].id
  );
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTokens, setAcceptedTokens] = useState<SupportedToken[]>([]);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<Hex | null>(null);
  const [balancesByToken, setBalancesByToken] = useState<Record<string, bigint>>({});
  const [onchainReady, setOnchainReady] = useState(false);
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
    connectError,
    clearConnectError
  } = useMiniPay(initialChainId);
  const contractAddress = useMemo(
    () => resolveContractAddressForChain(initialChainId, contractAddresses),
    [contractAddresses, initialChainId]
  );
  const selectedItem = useMemo(
    () => findItemById(store, selectedItemId) ?? store.menu[0],
    [selectedItemId, store]
  );
  const storeId = useMemo(() => encodeStoreId(store.slug), [store.slug]);
  const selectedToken = useMemo(
    () =>
      selectedPaymentToken
        ? getTokenByAddress(selectedPaymentToken, initialChainId) || null
        : null,
    [initialChainId, selectedPaymentToken]
  );
  const amount = useMemo(
    () =>
      selectedToken ? parseUnits(selectedItem.price, selectedToken.decimals) : 0n,
    [selectedItem.price, selectedToken]
  );
  const currentBalance = selectedPaymentToken
    ? balancesByToken[selectedPaymentToken.toLowerCase()] ?? null
    : null;
  const hasInsufficientBalance =
    selectedToken !== null && currentBalance !== null && currentBalance < amount;
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useAutoDismissMessage(error, clearError);
  useAutoDismissMessage(connectError, clearConnectError);

  useEffect(() => {
    async function loadState() {
      if (!contractAddress) {
        setOnchainReady(false);
        setAcceptedTokens([]);
        return;
      }

      const onchainStore = await fetchStore(storeId, initialChainId, contractAddress);
      setOnchainReady(Boolean(onchainStore?.exists));

      const acceptedTokenAddresses =
        onchainStore?.exists
          ? await fetchStoreAcceptedTokens(storeId, initialChainId, contractAddress)
          : [];
      const nextAcceptedTokens = (
        acceptedTokenAddresses.length > 0
          ? acceptedTokenAddresses
          : onchainStore?.token
            ? [onchainStore.token]
            : [getPrimaryPaymentToken(initialChainId)?.address].filter(Boolean)
      )
        .map((address) => getTokenByAddress(address as Hex, initialChainId))
        .filter(Boolean) as SupportedToken[];
      setAcceptedTokens(nextAcceptedTokens);

      if (!account || isWrongChain || !onchainStore?.exists) {
        setProgress(0);
        setBalancesByToken({});
        return;
      }

      const [nextProgress, nextBalances] = await Promise.all([
        fetchProgress(account, storeId, initialChainId, contractAddress),
        Promise.all(
          nextAcceptedTokens.map(async (token) => [
            token.address.toLowerCase(),
            await readBalance(token.address, account, initialChainId)
          ] as const)
        )
      ]);

      setProgress(nextProgress?.stamps ?? 0);
      setBalancesByToken(Object.fromEntries(nextBalances));
    }

    void loadState();
  }, [account, contractAddress, initialChainId, isWrongChain, storeId]);

  useEffect(() => {
    if (acceptedTokens.length === 0) {
      setSelectedPaymentToken(null);
      return;
    }

    setSelectedPaymentToken((current) => {
      if (
        current &&
        acceptedTokens.some((token) => token.address.toLowerCase() === current.toLowerCase())
      ) {
        return current;
      }

      const tokenWithBalance = acceptedTokens.find((token) => {
        const balance = balancesByToken[token.address.toLowerCase()];
        if (balance === undefined) return false;
        return balance >= parseUnits(selectedItem.price, token.decimals);
      });

      return tokenWithBalance?.address ?? acceptedTokens[0].address;
    });
  }, [acceptedTokens, balancesByToken, selectedItem.price]);

  async function handleCheckout() {
    if (!account) {
      await connect();
      return;
    }

    if (isWrongChain) {
      setError(
        locale === "pt-BR"
          ? `Troque sua carteira para ${expectedChainLabel} antes de continuar.`
          : `Switch your wallet to ${expectedChainLabel} before continuing.`
      );
      return;
    }

    if (!selectedToken || !selectedPaymentToken) {
      setError(dictionary.messages.genericActionFailed);
      return;
    }

    if (hasInsufficientBalance) {
      setError(dictionary.messages.insufficientBalance);
      return;
    }

    if (!contractAddress) {
      setError(dictionary.common.contractMissing);
      return;
    }

    const onchainStore = await fetchStore(storeId, initialChainId, contractAddress);
    if (!onchainStore?.exists) {
      setError(dictionary.messages.storeNotReady);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setStatus(
        locale === "pt-BR"
          ? `Checando allowance de ${selectedToken.symbol}...`
          : `Checking ${selectedToken.symbol} allowance...`
      );

      const allowance = await readAllowance(
        selectedPaymentToken,
        account,
        contractAddress,
        initialChainId
      );

      if (allowance < amount) {
        setStatus(
          locale === "pt-BR"
            ? `Aprovando ${selectedToken.symbol} para este pagamento...`
            : `Approving ${selectedToken.symbol} for this payment...`
        );
        const approvalHash = await approveToken({
          contractAddress,
          tokenAddress: selectedPaymentToken,
          amount,
          chainId: initialChainId
        });
        await waitForTransaction(approvalHash, initialChainId);
      }

      setStatus(
        locale === "pt-BR"
          ? `Enviando pagamento em ${selectedToken.symbol} e registrando Selos...`
          : `Sending ${selectedToken.symbol} payment and recording Stamps...`
      );
      const txHash = await purchaseTx({
        contractAddress,
        storeId,
        paymentToken: selectedPaymentToken,
        amount,
        itemRef: selectedItem.id,
        chainId: initialChainId
      });
      await waitForTransaction(txHash, initialChainId);

      router.push(
        `/success?mode=purchase&tx=${txHash}&store=${store.slug}&item=${selectedItem.id}`
      );
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.purchaseFailed));
    } finally {
      setIsSubmitting(false);
      setStatus(null);
    }
  }

  const checkoutDisabled =
    isSubmitting || !onchainReady || !selectedToken || hasInsufficientBalance;

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
      backHref={buildDashboardUrl({ role: "customer", tab: "stores" })}
      backLabel={locale === "pt-BR" ? "Voltar ao dashboard" : "Back to dashboard"}
      eyebrow={openedFromQr ? dictionary.store.qrEyebrow : dictionary.store.eyebrow}
      title={resolveText(store.name, locale)}
      description={`${resolveText(store.summary, locale)} ${dictionary.brand.shortDescription}`}
      aside={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.store.checkoutTitle}</CardTitle>
              <CardDescription>{dictionary.store.checkoutDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-[#ECEAF4] bg-[#F8F6FC] px-4 py-4">
                <p className="text-sm font-semibold text-[#1B1630]">
                  {resolveText(selectedItem.name, locale)}
                </p>
                <p className="mt-1 text-sm text-[#6D6783]">
                  {resolveText(selectedItem.description, locale)}
                </p>
                <p className="mt-3 text-2xl font-semibold text-[#1B1630]">
                  {selectedToken ? formatPaymentAmount(amount, locale, selectedToken) : "—"}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#ECEAF4] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.common.rule}
                </p>
                <p className="mt-2 text-sm text-[#1B1630]">
                  {buildStampRuleCopy(store, locale)} · {buildRewardCopy(store, locale)}
                </p>
                <p className="mt-1 text-sm text-[#6D6783]">
                  {dictionary.common.minimumEligible}: {store.loyalty.minimumPurchase}{" "}
                  {selectedToken?.symbol ?? dictionary.common.currencyLabel}
                </p>
              </div>

              {acceptedTokens.length > 1 ? (
                <HeadlessSelect
                  value={selectedPaymentToken ?? ""}
                  onChange={(value) => {
                    setError(null);
                    setSelectedPaymentToken(value as Hex);
                  }}
                  label={locale === "pt-BR" ? "Token de pagamento" : "Payment token"}
                  options={acceptedTokens.map((token) => ({
                    value: token.address,
                    label: token.symbol,
                    description: token.name
                  }))}
                />
              ) : null}

              {account ? (
                <div className="rounded-[24px] border border-[#ECEAF4] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#1B1630]">
                    {dictionary.common.currentWallet}: {formatWalletLabel(account)}
                  </p>
                  <p className="mt-1 text-sm text-[#6D6783]">
                    {dictionary.common.currentBalance}:{" "}
                    {currentBalance === null || !selectedToken
                      ? dictionary.common.loadingBalance
                      : formatPaymentAmount(currentBalance, locale, selectedToken)}
                  </p>
                  {hasInsufficientBalance ? (
                    <p className="mt-2 text-sm text-[#8C3A3A]">
                      {dictionary.messages.insufficientBalance}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!account && hasProvider && (!isMiniPay || isDisconnectedByUser) ? (
                <Button onClick={() => void connect()}>
                  {isConnecting
                    ? `${dictionary.actions.connectWallet}...`
                    : dictionary.actions.connectWallet}
                </Button>
              ) : null}

              <Button onClick={() => void handleCheckout()} disabled={checkoutDisabled}>
                {isSubmitting
                  ? `${dictionary.actions.payNow}...`
                  : dictionary.actions.payAndEarn}
              </Button>

              {status ? <p className="text-sm text-[#6D6783]">{status}</p> : null}
              {error || connectError ? (
                <p className="rounded-2xl border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
                  {error || connectError}
                </p>
              ) : null}
              {!onchainReady ? (
                <p className="rounded-2xl border border-[#F5E8C8] bg-[#FFFBF2] px-4 py-3 text-sm text-[#8B6A21]">
                  {dictionary.messages.storeNotReady}
                </p>
              ) : null}
            </CardContent>
          </Card>

        </div>
      }
    >
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <StoreLogo
                name={resolveText(store.name, locale)}
                imageUrl={store.storeLogoUrl}
                size="lg"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#625B78]">
                  {resolveText(store.name, locale)}
                </p>
                <p className="text-sm text-[#625B78]">
                  {resolveText(store.category, locale)} · {resolveText(store.city, locale)}
                  {openedFromQr ? ` · ${dictionary.store.openedViaQr}` : ""}
                </p>
              </div>
            </div>
            <CardTitle>{dictionary.store.selectItemTitle}</CardTitle>
            <CardDescription>{dictionary.store.selectItemDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {store.menu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                className={`rounded-[28px] border px-5 py-5 text-left transition ${
                  item.id === selectedItem.id
                    ? "border-[#B59AF2] bg-[#FCFAFF]"
                    : "border-[#ECEAF4] bg-white hover:border-[#D8CCF7]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[#1B1630]">
                      {resolveText(item.name, locale)}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[#6D6783]">
                      {resolveText(item.description, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#1B1630]">
                      {selectedToken
                        ? formatPaymentAmount(
                            parseUnits(item.price, selectedToken.decimals),
                            locale,
                            selectedToken
                          )
                        : item.price}
                    </p>
                    {item.badge ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                        {resolveText(item.badge, locale)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.store.progressTitle}</CardTitle>
            <CardDescription>{dictionary.store.progressDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressMeter value={progress} total={store.loyalty.stampsRequired} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-t border-[#EEE8F5] pt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.common.reward}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1B1630]">
                  {buildRewardCopy(store, locale)}
                </p>
              </div>
              <div className="border-t border-[#EEE8F5] pt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.store.nextStepTitle}
                </p>
                <p className="mt-2 text-sm text-[#1B1630]">
                  {dictionary.store.nextStepDescription}{" "}
                  <Link
                    href={buildDashboardUrl({ role: "customer", tab: "rewards" })}
                    className="font-semibold text-[#7B3FE4]"
                  >
                    {dictionary.common.rewardsLabel}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppChrome>
  );
}
