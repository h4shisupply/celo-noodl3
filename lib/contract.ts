import type { Hex } from "viem";
import { getAddress } from "viem";
import { loyaltyAbi } from "./abi";
import { getContractAddress, getDefaultChainId } from "./chains";
import { normalizeRemoteImageUrl } from "./format";
import { decodeStoreId } from "./store-id";
import { getBrowserPublicClient } from "./wallet";

export type RewardType = "fixed_amount" | "free_item";

export type StoreRecord = {
  storeId: Hex;
  slug: string;
  payout: Hex;
  manager: Hex;
  token: Hex;
  minPurchaseAmount: bigint;
  stampsPerPurchase: number;
  stampsRequired: number;
  rewardType: RewardType;
  rewardValue: bigint;
  active: boolean;
  exists: boolean;
};

export type ProgressRecord = {
  stamps: number;
  stampsRequired: number;
  stampsPerPurchase: number;
  rewardType: RewardType;
  rewardValue: bigint;
  canClaim: boolean;
};

export type ClaimRecord = {
  id: bigint;
  storeId: Hex;
  user: Hex;
  burnedStamps: number;
  rewardType: RewardType;
  rewardValue: bigint;
  claimedAt: number;
  consumedAt: number;
  consumed: boolean;
  exists: boolean;
};

export type UserProfileRecord = {
  displayName: string;
  avatarUrl?: string;
  updatedAt: number;
  exists: boolean;
};

function normalizeRewardType(value: number): RewardType {
  return value === 1 ? "free_item" : "fixed_amount";
}

function resolveAddress(
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  return contractAddressOverride || getContractAddress(chainId);
}

export async function fetchStore(
  storeId: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const store = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getStore",
      args: [storeId]
    });

    return {
      storeId,
      slug: decodeStoreId(storeId),
      payout: getAddress(store.payout) as Hex,
      manager: getAddress(store.manager) as Hex,
      token: getAddress(store.token) as Hex,
      minPurchaseAmount: store.minPurchaseAmount,
      stampsPerPurchase: Number(store.stampsPerPurchase),
      stampsRequired: Number(store.stampsRequired),
      rewardType: normalizeRewardType(Number(store.rewardType)),
      rewardValue: store.rewardValue,
      active: store.active,
      exists: store.exists
    } satisfies StoreRecord;
  } catch {
    return null;
  }
}

export async function fetchProgress(
  user: Hex,
  storeId: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const progress = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getProgress",
      args: [user, storeId]
    });

    return {
      stamps: Number(progress[0]),
      stampsRequired: Number(progress[1]),
      stampsPerPurchase: Number(progress[2]),
      rewardType: normalizeRewardType(Number(progress[3])),
      rewardValue: progress[4],
      canClaim: progress[5]
    } satisfies ProgressRecord;
  } catch {
    return null;
  }
}

export async function fetchClaim(
  claimId: bigint,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const claim = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getClaim",
      args: [claimId]
    });

    return {
      id: claim.id,
      storeId: claim.storeId,
      user: getAddress(claim.user) as Hex,
      burnedStamps: Number(claim.burnedStamps),
      rewardType: normalizeRewardType(Number(claim.rewardType)),
      rewardValue: claim.rewardValue,
      claimedAt: Number(claim.claimedAt),
      consumedAt: Number(claim.consumedAt),
      consumed: claim.consumed,
      exists: claim.exists
    } satisfies ClaimRecord;
  } catch {
    return null;
  }
}

export async function fetchProfile(
  user: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const profile = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getProfile",
      args: [user]
    });

    if (!profile.exists) {
      return null;
    }

    return {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl
        ? normalizeRemoteImageUrl(profile.avatarUrl) || undefined
        : undefined,
      updatedAt: Number(profile.updatedAt),
      exists: profile.exists
    } satisfies UserProfileRecord;
  } catch {
    return null;
  }
}

export async function supportsProfileFeature(
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return false;

  try {
    const client = getBrowserPublicClient(chainId);
    await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getProfile",
      args: ["0x0000000000000000000000000000000000000000"]
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchStoreParticipants(
  storeId: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return [];

  try {
    const client = getBrowserPublicClient(chainId);
    const participants = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getStoreParticipants",
      args: [storeId]
    });

    return participants.map((address) => getAddress(address) as Hex);
  } catch {
    return [];
  }
}

export async function fetchStoreAcceptedTokens(
  storeId: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return [];

  try {
    const client = getBrowserPublicClient(chainId);
    const acceptedTokens = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getStoreAcceptedTokens",
      args: [storeId]
    });

    return acceptedTokens.map((address) => getAddress(address) as Hex);
  } catch {
    return [];
  }
}

export async function fetchUserClaimIds(
  user: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return [];

  try {
    const client = getBrowserPublicClient(chainId);
    return await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getUserClaimIds",
      args: [user]
    });
  } catch {
    return [];
  }
}

export async function fetchStoreClaimIds(
  storeId: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return [];

  try {
    const client = getBrowserPublicClient(chainId);
    return await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getStoreClaimIds",
      args: [storeId]
    });
  } catch {
    return [];
  }
}
