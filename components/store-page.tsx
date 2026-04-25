"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits, type Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { ProgressMeter } from "./progress-meter";
import { useLocale } from "./locale-provider";
import { StoreLogo } from "./store-logo";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HeadlessSelect } from "./ui/headless-select";
import {
  buildRewardCopy,
  buildStampRuleCopy,
  formatPaymentAmount,
  getActiveMenuItems,
  resolveText,
  type MenuItem,
  type StoreCatalogEntry
} from "../lib/catalog";
import { formatWalletLabel } from "../lib/claim-code";
import { buildDashboardUrl } from "../lib/dashboard-route";
import { fetchProgress, fetchStore, fetchStoreAcceptedTokens } from "../lib/contract";
import { resolveContractAddressForChain } from "../lib/chains";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { interpolate } from "../lib/i18n";
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

type CartLine = {
  item: MenuItem;
  quantity: number;
};

function getCartAmount(cartLines: CartLine[], decimals: number) {
  return cartLines.reduce(
    (total, line) => total + parseUnits(line.item.price, decimals) * BigInt(line.quantity),
    0n
  );
}

function buildCartItemRef(cartLines: CartLine[]) {
  if (cartLines.length === 1 && cartLines[0].quantity === 1) {
    return cartLines[0].item.id;
  }

  return `cart:${cartLines.map((line) => `${line.item.id}x${line.quantity}`).join(",")}`;
}

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
  const visibleItems = useMemo(() => getActiveMenuItems(store), [store]);
  const initialPaymentToken = getPrimaryPaymentToken(initialChainId)?.address ?? null;
  const initialQrItem = openedFromQr
    ? visibleItems.find((item) => item.id === initialItemId)
    : undefined;
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>(
    initialQrItem ? { [initialQrItem.id]: 1 } : {}
  );
  const [isCheckoutFocused, setIsCheckoutFocused] = useState(Boolean(initialQrItem));
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTokens, setAcceptedTokens] = useState<SupportedToken[]>([]);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<Hex | null>(
    initialPaymentToken
  );
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
  const cartLines = useMemo(
    () =>
      visibleItems
        .map((item) => ({
          item,
          quantity: cartQuantities[item.id] ?? 0
        }))
        .filter((line) => line.quantity > 0),
    [cartQuantities, visibleItems]
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
      selectedToken
        ? getCartAmount(cartLines, selectedToken.decimals)
        : 0n,
    [cartLines, selectedToken]
  );
  const cartItemCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const hasCartItems = cartItemCount > 0;
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

      const tokenWithBalance =
        cartLines.length > 0
          ? acceptedTokens.find((token) => {
              const balance = balancesByToken[token.address.toLowerCase()];
              if (balance === undefined) return false;
              return balance >= getCartAmount(cartLines, token.decimals);
            })
          : undefined;

      return tokenWithBalance?.address ?? acceptedTokens[0].address;
    });
  }, [acceptedTokens, balancesByToken, cartLines]);

  useEffect(() => {
    if (!hasCartItems && isCheckoutFocused) {
      setIsCheckoutFocused(false);
    }
  }, [hasCartItems, isCheckoutFocused]);

  function setItemQuantity(itemId: string, quantity: number) {
    setError(null);
    setCartQuantities((current) => {
      const nextQuantity = Math.max(0, Math.min(99, quantity));
      const next = { ...current };

      if (nextQuantity === 0) {
        delete next[itemId];
      } else {
        next[itemId] = nextQuantity;
      }

      return next;
    });
  }

  async function handleCheckout() {
    if (!account) {
      await connect();
      return;
    }

    if (isWrongChain) {
      setError(
        interpolate(dictionary.messages.switchToNetworkBeforeContinue, {
          network: expectedChainLabel
        })
      );
      return;
    }

    if (!hasCartItems || !selectedToken || !selectedPaymentToken) {
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
        interpolate(dictionary.messages.checkingTokenAllowance, {
          token: selectedToken.symbol
        })
      );

      const allowance = await readAllowance(
        selectedPaymentToken,
        account,
        contractAddress,
        initialChainId
      );

      if (allowance < amount) {
        setStatus(
          interpolate(dictionary.messages.approvingTokenPayment, {
            token: selectedToken.symbol
          })
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
        interpolate(dictionary.messages.sendingTokenPayment, {
          token: selectedToken.symbol
        })
      );
      const txHash = await purchaseTx({
        contractAddress,
        storeId,
        paymentToken: selectedPaymentToken,
        amount,
        itemRef: buildCartItemRef(cartLines),
        chainId: initialChainId
      });
      await waitForTransaction(txHash, initialChainId);

      const successParams = new URLSearchParams({
        mode: "purchase",
        tx: txHash,
        store: store.slug
      });
      if (cartLines.length === 1 && cartLines[0].quantity === 1) {
        successParams.set("item", cartLines[0].item.id);
      } else {
        successParams.set("items", buildCartItemRef(cartLines));
      }

      router.push(`/success?${successParams.toString()}`);
    } catch (nextError) {
      setError(getUserFacingErrorMessage(nextError, dictionary.messages.purchaseFailed));
    } finally {
      setIsSubmitting(false);
      setStatus(null);
    }
  }

  const checkoutDisabled =
    isSubmitting ||
    !onchainReady ||
    !selectedToken ||
    !selectedPaymentToken ||
    hasInsufficientBalance ||
    !hasCartItems;
  const stampBadgeLabel = account
    ? interpolate(dictionary.store.currentStampsBadge, {
        stamps: progress.toString(),
        total: store.loyalty.stampsRequired.toString()
      })
    : dictionary.store.connectForStampsBadge;

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
      backLabel={dictionary.actions.backToDashboard}
      eyebrow={openedFromQr ? dictionary.store.qrEyebrow : dictionary.store.eyebrow}
      title={resolveText(store.name, locale)}
      description={`${resolveText(store.summary, locale)} ${dictionary.brand.shortDescription}`}
    >
      {isCheckoutFocused ? (
        <section className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setError(null);
                  setIsCheckoutFocused(false);
                }}
              >
                {dictionary.store.backToItems}
              </Button>
              <div>
                <CardTitle>{dictionary.store.checkoutTitle}</CardTitle>
                <CardDescription>{dictionary.store.checkoutDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[24px] border border-[#ECEAF4] bg-[#F8F6FC] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B84A1]">
                  {dictionary.store.selectedItemsTitle}
                </p>
                <div className="mt-4 space-y-3">
                  {cartLines.map((line) => (
                    <div
                      key={line.item.id}
                      className="flex flex-wrap items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1B1630]">
                          {resolveText(line.item.name, locale)}
                        </p>
                        <p className="mt-1 text-sm text-[#6D6783]">
                          {dictionary.store.quantityLabel}: {line.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#1B1630]">
                        {selectedToken
                          ? formatPaymentAmount(
                              getCartAmount([line], selectedToken.decimals),
                              locale,
                              selectedToken
                            )
                          : line.item.price}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#E5DFF0] pt-4">
                  <p className="text-sm font-semibold text-[#1B1630]">
                    {dictionary.store.subtotalLabel}
                  </p>
                  <p className="text-2xl font-semibold text-[#1B1630]">
                    {selectedToken ? formatPaymentAmount(amount, locale, selectedToken) : "--"}
                  </p>
                </div>
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
                  label={dictionary.store.paymentTokenLabel}
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
        </section>
      ) : (
        <section className="space-y-6">
          <Card>
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
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
                <Badge>{stampBadgeLabel}</Badge>
              </div>
              <div>
                <CardTitle>{dictionary.store.selectItemTitle}</CardTitle>
                <CardDescription>{dictionary.store.selectItemDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {visibleItems.map((item) => {
                const quantity = cartQuantities[item.id] ?? 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[28px] border px-5 py-5 text-left transition ${
                      quantity > 0
                        ? "border-[#B59AF2] bg-[#FCFAFF]"
                        : "border-[#ECEAF4] bg-white hover:border-[#D8CCF7]"
                    }`}
                  >
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-[#1B1630]">
                          {resolveText(item.name, locale)}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[#6D6783]">
                          {resolveText(item.description, locale)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
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
                      <div className="inline-flex h-10 shrink-0 items-center overflow-hidden rounded-full border border-[#E1D9F0] bg-white">
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center text-base font-semibold text-[#241B3C] transition hover:bg-[#F7F5FF] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={interpolate(dictionary.store.decreaseQuantityLabel, {
                            item: resolveText(item.name, locale)
                          })}
                          disabled={quantity === 0}
                          onClick={() => setItemQuantity(item.id, quantity - 1)}
                        >
                          -
                        </button>
                        <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#E1D9F0] px-3 text-sm font-semibold text-[#1B1630]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center text-base font-semibold text-[#241B3C] transition hover:bg-[#F7F5FF]"
                          aria-label={interpolate(dictionary.store.increaseQuantityLabel, {
                            item: resolveText(item.name, locale)
                          })}
                          onClick={() => setItemQuantity(item.id, quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {visibleItems.length === 0 ? (
                <p className="rounded-[24px] border border-[#ECEAF4] bg-[#FBFAFD] px-5 py-4 text-sm text-[#6D6783]">
                  {dictionary.store.noActiveItems}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE8F5] pt-5">
                <p className="text-sm text-[#6D6783]">
                  {hasCartItems
                    ? interpolate(dictionary.store.itemsSelectedLabel, {
                        count: cartItemCount.toString()
                      })
                    : dictionary.store.noItemsSelectedLabel}
                </p>
                <Button
                  onClick={() => {
                    setError(null);
                    setIsCheckoutFocused(true);
                  }}
                  disabled={!hasCartItems}
                >
                  {dictionary.store.goToCheckout}
                </Button>
              </div>
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
      )}
    </AppChrome>
  );
}
