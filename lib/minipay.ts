"use client";

import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import {
  getChainLabel,
  CELO_SEPOLIA_CHAIN_ID
} from "./chains";
import { getUserFacingErrorMessage } from "./error-message";
import { getRuntimeDictionary, interpolate } from "./i18n";
import { ensureInjectedChain } from "./wallet";

type EthereumProvider = NonNullable<Window["ethereum"]>;
const DISCONNECT_STORAGE_KEY = "noodl3_wallet_disconnected";

async function detectChainId(fallbackChainId: number) {
  if (!window.ethereum) return fallbackChainId;
  const raw = (await window.ethereum.request({
    method: "eth_chainId"
  })) as string;
  const chainId = Number.parseInt(raw, 16);
  return Number.isFinite(chainId) ? chainId : fallbackChainId;
}

export function useMiniPay(initialChainId = CELO_SEPOLIA_CHAIN_ID) {
  const [account, setAccount] = useState<Hex | null>(null);
  const [chainId, setChainId] = useState<number>(initialChainId);
  const [hasProvider, setHasProvider] = useState(false);
  const [hasCheckedProvider, setHasCheckedProvider] = useState(false);
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnectedByUser, setIsDisconnectedByUser] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const runtimeDictionary = getRuntimeDictionary();

  function isSoftDisconnected() {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(DISCONNECT_STORAGE_KEY) === "1";
  }

  const switchToDefaultChain = useCallback(async (options?: { silent?: boolean }) => {
    if (!window.ethereum) {
      const message = runtimeDictionary.messages.noWalletFound;
      setHasProvider(false);
      setHasCheckedProvider(true);
      if (!options?.silent) {
        setConnectError(message);
      }
      return null;
    }

    if (window.ethereum.isMiniPay) {
      return null;
    }

    try {
      const nextChainId = await ensureInjectedChain(initialChainId);
      setChainId(nextChainId);
      if (!options?.silent) {
        setConnectError(null);
      }
      return nextChainId;
    } catch (error) {
      const message = getUserFacingErrorMessage(
        error,
        interpolate(runtimeDictionary.messages.switchWalletRequired, {
          network: getChainLabel(initialChainId)
        })
      );
      if (!options?.silent) {
        setConnectError(message);
      }
      return null;
    }
  }, [initialChainId, runtimeDictionary.messages.noWalletFound, runtimeDictionary.messages.switchWalletRequired]);

  const refreshWalletState = useCallback(async () => {
    if (typeof window === "undefined") return;

    const provider = window.ethereum;
    setHasProvider(Boolean(provider));
    setIsMiniPay(Boolean(provider?.isMiniPay));
    const disconnected = isSoftDisconnected();
    setIsDisconnectedByUser(disconnected);

    if (!provider) {
      setAccount(null);
      setHasCheckedProvider(true);
      return;
    }

    try {
      const nextChainId = await detectChainId(initialChainId);
      setChainId(nextChainId);

      if (disconnected) {
        setAccount(null);
        return;
      }

      const accounts = (await provider.request({
        method: "eth_accounts",
        params: []
      })) as Hex[];
      setAccount(accounts[0] || null);
    } catch {
      setAccount(null);
    } finally {
      setHasCheckedProvider(true);
    }
  }, [initialChainId]);

  const connect = useCallback(async (options?: { silent?: boolean }) => {
    if (!window.ethereum) {
      const message = runtimeDictionary.messages.noWalletFound;
      setHasProvider(false);
      setHasCheckedProvider(true);
      if (!options?.silent) {
        setConnectError(message);
      }
      return null;
    }

    setIsConnecting(true);
    if (!options?.silent) {
      setConnectError(null);
    }

    try {
      window.localStorage.removeItem(DISCONNECT_STORAGE_KEY);
      setIsDisconnectedByUser(false);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
        params: []
      })) as Hex[];
      const nextChainId = await detectChainId(initialChainId);

      setHasProvider(true);
      setHasCheckedProvider(true);
      setAccount(accounts[0] || null);
      setChainId(nextChainId);

      return accounts[0] || null;
    } catch (error) {
      if (options?.silent) {
        return null;
      }

      const message =
        getUserFacingErrorMessage(error, runtimeDictionary.messages.couldNotConnectWallet);
      setConnectError(message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [
    initialChainId,
    runtimeDictionary.messages.couldNotConnectWallet,
    runtimeDictionary.messages.noWalletFound
  ]);

  const disconnect = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISCONNECT_STORAGE_KEY, "1");
    }
    setIsDisconnectedByUser(true);
    setConnectError(null);
    setAccount(null);
  }, []);

  const clearConnectError = useCallback(() => {
    setConnectError(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const provider = window.ethereum;
    setHasProvider(Boolean(provider));
    setIsMiniPay(Boolean(provider?.isMiniPay));
    setIsDisconnectedByUser(isSoftDisconnected());

    if (!provider) {
      setAccount(null);
      setHasCheckedProvider(true);
      return;
    }

    const syncFromProvider = async () => {
      await refreshWalletState();
    };

    const handleAccountsChanged = (accounts: unknown) => {
      if (isSoftDisconnected()) {
        setAccount(null);
        return;
      }
      const nextAccounts = accounts as Hex[];
      setAccount(nextAccounts[0] || null);
    };

    const handleChainChanged = (nextChainId: unknown) => {
      const parsed = Number.parseInt(nextChainId as string, 16);
      if (Number.isFinite(parsed)) {
        setChainId(parsed);
      }
    };

    void syncFromProvider();

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [initialChainId, refreshWalletState]);

  return {
    account,
    chainId,
    expectedChainId: initialChainId,
    expectedChainLabel: getChainLabel(initialChainId),
    isWrongChain: chainId !== initialChainId,
    hasProvider,
    hasCheckedProvider,
    isMiniPay,
    isConnecting,
    isDisconnectedByUser,
    connectError,
    connect,
    switchToDefaultChain,
    refreshWalletState,
    disconnect,
    clearConnectError
  };
}
