"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeEventLog,
  http,
  parseUnits,
  type Hex,
  type TransactionReceipt
} from "viem";
import { erc20Abi, loyaltyAbi } from "./abi";
import {
  getAddChainParameters,
  getChainConfig,
  getChainHex,
  getChainLabel,
  getDefaultChainId,
  getRpcUrl
} from "./chains";
import { getRuntimeDictionary, interpolate } from "./i18n";

function ensureProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(getRuntimeDictionary().messages.noWalletFound);
  }

  return window.ethereum;
}

export async function getInjectedAccounts() {
  const provider = ensureProvider();
  return (await provider.request({
    method: "eth_requestAccounts",
    params: []
  })) as Hex[];
}

export async function getInjectedChainId() {
  const provider = ensureProvider();
  const raw = (await provider.request({ method: "eth_chainId" })) as string;
  const chainId = Number.parseInt(raw, 16);
  return Number.isFinite(chainId) ? chainId : getDefaultChainId();
}

export async function ensureInjectedChain(targetChainId = getDefaultChainId()) {
  const provider = ensureProvider();
  const targetHex = getChainHex(targetChainId);
  const rawCurrentChainId = (await provider.request({
    method: "eth_chainId"
  })) as string;
  const currentChainId = Number.parseInt(rawCurrentChainId, 16);

  if (currentChainId === targetChainId) {
    return targetChainId;
  }

  if (provider.isMiniPay) {
    throw new Error(
      interpolate(getRuntimeDictionary().messages.miniPayWrongNetwork, {
        network: getChainLabel(targetChainId)
      })
    );
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }]
    });
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "number"
        ? Number((error as { code: number }).code)
        : undefined;

    if (code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [getAddChainParameters(targetChainId)]
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }]
      });
    } else if (code === 4001) {
      throw new Error(
        interpolate(getRuntimeDictionary().messages.switchWalletRequired, {
          network: getChainLabel(targetChainId)
        })
      );
    } else {
      throw error;
    }
  }

  return targetChainId;
}

async function requireInjectedChain(targetChainId = getDefaultChainId()) {
  const currentChainId = await getInjectedChainId();
  if (currentChainId === targetChainId) {
    return targetChainId;
  }

  if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
    throw new Error(
      interpolate(getRuntimeDictionary().messages.miniPayWrongNetwork, {
        network: getChainLabel(targetChainId)
      })
    );
  }

  throw new Error(
    interpolate(getRuntimeDictionary().messages.switchWalletRequired, {
      network: getChainLabel(targetChainId)
    })
  );
}

export async function getInjectedWalletClient(chainId?: number) {
  const activeChainId = chainId ?? (await getInjectedChainId());
  await requireInjectedChain(activeChainId);
  return createWalletClient({
    chain: getChainConfig(activeChainId),
    transport: custom(ensureProvider())
  });
}

export async function signWalletMessage(params: {
  message: string;
  chainId?: number;
}) {
  const { message, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  const signature = await walletClient.signMessage({
    account,
    message
  });

  return {
    account,
    signature
  };
}

export function getBrowserPublicClient(chainId = getDefaultChainId()) {
  return createPublicClient({
    chain: getChainConfig(chainId),
    transport: http(getRpcUrl(chainId))
  });
}

export async function readAllowance(
  tokenAddress: Hex,
  owner: Hex,
  spender: Hex,
  chainId?: number
) {
  const client = getBrowserPublicClient(chainId);
  return client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender]
  });
}

export async function readBalance(
  tokenAddress: Hex,
  owner: Hex,
  chainId?: number
) {
  const client = getBrowserPublicClient(chainId);
  return client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner]
  });
}

export async function approveToken(params: {
  contractAddress: Hex;
  tokenAddress: Hex;
  amount: bigint;
  chainId?: number;
}) {
  const { contractAddress, tokenAddress, amount, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [contractAddress, amount]
  });
}

export async function purchaseTx(params: {
  contractAddress: Hex;
  storeId: Hex;
  paymentToken: Hex;
  amount: bigint;
  itemRef: string;
  chainId?: number;
}) {
  const { contractAddress, storeId, paymentToken, amount, itemRef, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "purchase",
    args: [storeId, paymentToken, amount, itemRef]
  });
}

export async function claimRewardTx(params: {
  contractAddress: Hex;
  storeId: Hex;
  chainId?: number;
}) {
  const { contractAddress, storeId, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "claimReward",
    args: [storeId]
  });
}

export async function consumeRewardTx(params: {
  contractAddress: Hex;
  claimId: bigint;
  chainId?: number;
}) {
  const { contractAddress, claimId, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "consumeReward",
    args: [claimId]
  });
}

export async function configureStoreTx(params: {
  contractAddress: Hex;
  storeId: Hex;
  payout: Hex;
  manager: Hex;
  token: Hex;
  minPurchaseAmount: bigint;
  stampsPerPurchase: number;
  stampsRequired: number;
  rewardType: 0 | 1;
  rewardValue: bigint;
  active: boolean;
  chainId?: number;
}) {
  const {
    contractAddress,
    storeId,
    payout,
    manager,
    token,
    minPurchaseAmount,
    stampsPerPurchase,
    stampsRequired,
    rewardType,
    rewardValue,
    active,
    chainId
  } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "configureStore",
    args: [
      storeId,
      payout,
      manager,
      token,
      minPurchaseAmount,
      stampsPerPurchase,
      stampsRequired,
      rewardType,
      rewardValue,
      active
    ]
  });
}

export async function configureStoreAcceptedTokensTx(params: {
  contractAddress: Hex;
  storeId: Hex;
  tokens: Hex[];
  decimals: number[];
  chainId?: number;
}) {
  const { contractAddress, storeId, tokens, decimals, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "configureStoreAcceptedTokens",
    args: [storeId, tokens, decimals]
  });
}

export async function updateProfileTx(params: {
  contractAddress: Hex;
  displayName: string;
  avatarUrl: string;
  chainId?: number;
}) {
  const { contractAddress, displayName, avatarUrl, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "setProfile",
    args: [displayName, avatarUrl]
  });
}

export async function waitForTransaction(hash: Hex, chainId?: number) {
  const activeChainId = chainId ?? (await getInjectedChainId());
  const client = getBrowserPublicClient(activeChainId);
  return client.waitForTransactionReceipt({ hash });
}

export function parseUsdtAmount(amount: string) {
  return parseUnits(amount, 18);
}

export function extractClaimIdFromReceipt(receipt: TransactionReceipt) {
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: loyaltyAbi,
        data: log.data,
        topics: log.topics
      });

      if (decoded.eventName === "RewardClaimed") {
        return decoded.args.claimId;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  return null;
}
