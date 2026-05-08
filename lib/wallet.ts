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

export async function createProgramTx(params: {
  contractAddress: Hex;
  name: string;
  iconUrl: string;
  rewardDescription: string;
  stampsRequired: number;
  active: boolean;
  staticStampEnabled: boolean;
  chainId?: number;
}) {
  const {
    contractAddress,
    name,
    iconUrl,
    rewardDescription,
    stampsRequired,
    active,
    staticStampEnabled,
    chainId
  } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "createProgram",
    args: [name, iconUrl, rewardDescription, stampsRequired, active, staticStampEnabled]
  });
}

export async function updateProgramTx(params: {
  contractAddress: Hex;
  programId: bigint;
  name: string;
  iconUrl: string;
  rewardDescription: string;
  stampsRequired: number;
  active: boolean;
  staticStampEnabled: boolean;
  chainId?: number;
}) {
  const {
    contractAddress,
    programId,
    name,
    iconUrl,
    rewardDescription,
    stampsRequired,
    active,
    staticStampEnabled,
    chainId
  } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "updateProgram",
    args: [programId, name, iconUrl, rewardDescription, stampsRequired, active, staticStampEnabled]
  });
}

export async function collectStaticStampTx(params: {
  contractAddress: Hex;
  programId: bigint;
  chainId?: number;
}) {
  const { contractAddress, programId, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "collectStaticStamp",
    args: [programId]
  });
}

export async function issueManualStampTx(params: {
  contractAddress: Hex;
  programId: bigint;
  customer: Hex;
  chainId?: number;
}) {
  const { contractAddress, programId, customer, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "issueManualStamp",
    args: [programId, customer]
  });
}

export async function collectDynamicStampTx(params: {
  contractAddress: Hex;
  programId: bigint;
  nonce: Hex;
  expiresAt: bigint;
  signature: Hex;
  chainId?: number;
}) {
  const { contractAddress, programId, nonce, expiresAt, signature, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "collectDynamicStamp",
    args: [programId, nonce, expiresAt, signature]
  });
}

export async function signDynamicStampPayload(params: {
  contractAddress: Hex;
  programId: bigint;
  nonce: Hex;
  expiresAt: bigint;
  chainId?: number;
}) {
  const { contractAddress, programId, nonce, expiresAt, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);
  const publicClient = getBrowserPublicClient(activeChainId);
  const digest = await publicClient.readContract({
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "getDynamicStampDigest",
    args: [programId, nonce, expiresAt]
  });

  const signature = await walletClient.signMessage({
    account,
    message: { raw: digest }
  });

  return {
    account,
    signature
  };
}

export function generateDynamicStampNonce(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function claimRewardTx(params: {
  contractAddress: Hex;
  programId?: bigint;
  storeId?: Hex;
  chainId?: number;
}) {
  const { contractAddress, programId, storeId, chainId } = params;
  const [account] = await getInjectedAccounts();
  const activeChainId = chainId ?? (await getInjectedChainId());
  const walletClient = await getInjectedWalletClient(activeChainId);
  const normalizedProgramId = programId ?? (storeId ? BigInt(storeId) : 0n);

  return walletClient.writeContract({
    account,
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "claimReward",
    args: [normalizedProgramId]
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

export async function purchaseTx(..._args: unknown[]): Promise<Hex> {
  throw new Error("Item checkout was removed in the loyalty program pivot.");
}

export async function configureStoreTx(..._args: unknown[]): Promise<Hex> {
  throw new Error("Store configuration was removed in the loyalty program pivot.");
}

export async function configureStoreAcceptedTokensTx(..._args: unknown[]): Promise<Hex> {
  throw new Error("Store token configuration was removed in the loyalty program pivot.");
}

export function parseUsdtAmount(amount: string) {
  return parseUnits(amount, 18);
}

export function extractProgramIdFromReceipt(receipt: TransactionReceipt) {
  return extractEventArg(receipt, "ProgramCreated", "programId") as bigint | null;
}

export function extractClaimIdFromReceipt(receipt: TransactionReceipt) {
  return extractEventArg(receipt, "RewardClaimed", "claimId") as bigint | null;
}

function extractEventArg(
  receipt: TransactionReceipt,
  eventName: string,
  argName: string
) {
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: loyaltyAbi,
        data: log.data,
        topics: log.topics
      }) as {
        eventName: string;
        args: Record<string, unknown>;
      };

      if (decoded.eventName === eventName) {
        return decoded.args[argName] ?? null;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  return null;
}
