import type { Hex } from "viem";
import { getAddress } from "viem";
import { loyaltyAbi } from "./abi";
import { getContractAddress, getDefaultChainId } from "./chains";
import { normalizeRemoteImageUrl } from "./format";
import { getBrowserPublicClient } from "./wallet";

export type RequestStatus = "pending" | "approved" | "rejected";

export type ProgramRecord = {
  id: bigint;
  owner: Hex;
  name: string;
  rewardDescription: string;
  stampsRequired: number;
  active: boolean;
  exists: boolean;
};

export type ProgressRecord = {
  stamps: number;
  stampsRequired: number;
  rewardDescription: string;
  canClaim: boolean;
  stampsPerPurchase: number;
  rewardType: "fixed_amount" | "free_item";
  rewardValue: bigint;
};

export type VisitRequestRecord = {
  id: bigint;
  programId: bigint;
  customer: Hex;
  requestedAt: number;
  resolvedAt: number;
  resolvedBy: Hex;
  status: RequestStatus;
  exists: boolean;
};

export type ClaimRecord = {
  id: bigint;
  programId: bigint;
  user: Hex;
  burnedStamps: number;
  rewardDescription: string;
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

export type StoreRecord = {
  storeId?: Hex;
  slug?: string;
  payout: Hex;
  manager: Hex;
  token: Hex;
  minPurchaseAmount: bigint;
  stampsPerPurchase: number;
  stampsRequired: number;
  rewardType: "fixed_amount" | "free_item";
  rewardValue: bigint;
  active: boolean;
  exists: boolean;
};

function resolveAddress(
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  return contractAddressOverride || getContractAddress(chainId);
}

function normalizeRequestStatus(status: number): RequestStatus {
  if (status === 1) return "approved";
  if (status === 2) return "rejected";
  return "pending";
}

export async function fetchProgram(
  programId: bigint,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress || programId <= 0n) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const program = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getProgram",
      args: [programId]
    });

    return {
      id: program.id,
      owner: getAddress(program.owner) as Hex,
      name: program.name,
      rewardDescription: program.rewardDescription,
      stampsRequired: Number(program.stampsRequired),
      active: program.active,
      exists: program.exists
    } satisfies ProgramRecord;
  } catch {
    return null;
  }
}

export async function fetchPrograms(
  programIds: bigint[],
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const uniqueIds = [...new Set(programIds.map((id) => id.toString()))].map(BigInt);
  const programs = await Promise.all(
    uniqueIds.map((id) => fetchProgram(id, chainId, contractAddressOverride))
  );
  return programs.filter(Boolean) as ProgramRecord[];
}

export async function fetchProgress(
  user: Hex,
  programId: bigint | Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return null;

  try {
    const normalizedProgramId =
      typeof programId === "bigint" ? programId : BigInt(programId);
    const client = getBrowserPublicClient(chainId);
    const progress = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getProgress",
      args: [user, normalizedProgramId]
    });

    return {
      stamps: Number(progress[0]),
      stampsRequired: Number(progress[1]),
      rewardDescription: progress[2],
      canClaim: progress[3],
      stampsPerPurchase: 1,
      rewardType: "free_item",
      rewardValue: 0n
    } satisfies ProgressRecord;
  } catch {
    return null;
  }
}

export async function fetchVisitRequest(
  requestId: bigint,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress || requestId <= 0n) return null;

  try {
    const client = getBrowserPublicClient(chainId);
    const visitRequest = await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getVisitRequest",
      args: [requestId]
    });

    return {
      id: visitRequest.id,
      programId: visitRequest.programId,
      customer: getAddress(visitRequest.customer) as Hex,
      requestedAt: Number(visitRequest.requestedAt),
      resolvedAt: Number(visitRequest.resolvedAt),
      resolvedBy: getAddress(visitRequest.resolvedBy) as Hex,
      status: normalizeRequestStatus(Number(visitRequest.status)),
      exists: visitRequest.exists
    } satisfies VisitRequestRecord;
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
  if (!contractAddress || claimId <= 0n) return null;

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
      programId: claim.programId,
      user: getAddress(claim.user) as Hex,
      burnedStamps: Number(claim.burnedStamps),
      rewardDescription: claim.rewardDescription,
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

export async function fetchOwnerProgramIds(
  owner: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  return readProgramIdList("getOwnerProgramIds", owner, chainId, contractAddressOverride);
}

export async function fetchStaffProgramIds(
  staff: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  return readProgramIdList("getStaffProgramIds", staff, chainId, contractAddressOverride);
}

export async function fetchUserProgramIds(
  user: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  return readProgramIdList("getUserProgramIds", user, chainId, contractAddressOverride);
}

async function readProgramIdList(
  functionName: "getOwnerProgramIds" | "getStaffProgramIds" | "getUserProgramIds",
  account: Hex,
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
      functionName,
      args: [account]
    });
  } catch {
    return [];
  }
}

export async function fetchProgramParticipants(
  programId: bigint,
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
      functionName: "getProgramParticipants",
      args: [programId]
    });

    return participants.map((address) => getAddress(address) as Hex);
  } catch {
    return [];
  }
}

export async function fetchProgramVisitRequestIds(
  programId: bigint,
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
      functionName: "getProgramVisitRequestIds",
      args: [programId]
    });
  } catch {
    return [];
  }
}

export async function fetchPendingVisitRequestId(
  programId: bigint,
  customer: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return 0n;

  try {
    const client = getBrowserPublicClient(chainId);
    return await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "getPendingVisitRequestId",
      args: [programId, customer]
    });
  } catch {
    return 0n;
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

export async function fetchProgramClaimIds(
  programId: bigint,
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
      functionName: "getProgramClaimIds",
      args: [programId]
    });
  } catch {
    return [];
  }
}

export async function fetchIsProgramStaff(
  programId: bigint,
  account: Hex,
  chainId = getDefaultChainId(),
  contractAddressOverride?: Hex | null
) {
  const contractAddress = resolveAddress(chainId, contractAddressOverride);
  if (!contractAddress) return false;

  try {
    const client = getBrowserPublicClient(chainId);
    return await client.readContract({
      address: contractAddress,
      abi: loyaltyAbi,
      functionName: "isProgramStaff",
      args: [programId, account]
    });
  } catch {
    return false;
  }
}

export async function fetchContractOwner(
  ..._args: unknown[]
): Promise<Hex | null> {
  return null;
}

export async function fetchStore(
  ..._args: unknown[]
): Promise<StoreRecord | null> {
  return null;
}

export async function fetchStoreParticipants(
  ..._args: unknown[]
): Promise<Hex[]> {
  return [];
}

export async function fetchStoreAcceptedTokens(
  ..._args: unknown[]
): Promise<Hex[]> {
  return [];
}

export async function fetchStoreClaimIds(
  ..._args: unknown[]
): Promise<bigint[]> {
  return [];
}
