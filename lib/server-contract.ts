import "server-only";

import type { Hex } from "viem";
import { createPublicClient, getAddress, http } from "viem";
import { loyaltyAbi } from "./abi";
import { getChainConfig, getDefaultChainId, getRpcUrl } from "./chains";

function createServerPublicClient(chainId = getDefaultChainId()) {
  return createPublicClient({
    chain: getChainConfig(chainId),
    transport: http(getRpcUrl(chainId))
  });
}

export async function fetchContractOwnerServer(
  chainId = getDefaultChainId(),
  contractAddress?: Hex | null
) {
  if (!contractAddress) {
    return null;
  }

  const client = createServerPublicClient(chainId);
  const owner = await client.readContract({
    address: contractAddress,
    abi: loyaltyAbi,
    functionName: "owner",
    args: []
  });

  return getAddress(owner) as Hex;
}
