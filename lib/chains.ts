import type { Hex } from "viem";
import { celo, celoSepolia } from "viem/chains";
import { publicEnv } from "./env";
import { getRuntimeDictionary, interpolate, type Locale } from "./i18n";

export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_SEPOLIA_CHAIN_ID = 11142220;

export function getDefaultChainId(): number {
  return publicEnv.defaultChain === "celo"
    ? CELO_MAINNET_CHAIN_ID
    : CELO_SEPOLIA_CHAIN_ID;
}

export function getChainConfig(chainId = getDefaultChainId()) {
  return chainId === CELO_MAINNET_CHAIN_ID ? celo : celoSepolia;
}

export function getChainLabel(
  chainId = getDefaultChainId(),
  _locale?: Locale
) {
  if (chainId === CELO_MAINNET_CHAIN_ID) {
    return "Celo Mainnet";
  }

  if (chainId === CELO_SEPOLIA_CHAIN_ID) {
    return "Celo Sepolia";
  }

  return interpolate(getRuntimeDictionary().messages.unsupportedNetwork, {
    chainId
  });
}

export function getChainHex(chainId = getDefaultChainId()) {
  return `0x${chainId.toString(16)}`;
}

export function getRpcUrl(chainId = getDefaultChainId()) {
  return chainId === CELO_MAINNET_CHAIN_ID
    ? publicEnv.celoMainnetRpcUrl
    : publicEnv.celoSepoliaRpcUrl;
}

export function getExplorerBaseUrl(chainId = getDefaultChainId()) {
  return chainId === CELO_MAINNET_CHAIN_ID
    ? "https://celoscan.io"
    : "https://celo-sepolia.blockscout.com";
}

export function getAddChainParameters(chainId = getDefaultChainId()) {
  return {
    chainId: getChainHex(chainId),
    chainName: getChainLabel(chainId),
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18
    },
    rpcUrls: [getRpcUrl(chainId)],
    blockExplorerUrls: [getExplorerBaseUrl(chainId)]
  };
}

export function getContractAddress(chainId = getDefaultChainId()): Hex | null {
  return chainId === CELO_MAINNET_CHAIN_ID
    ? publicEnv.contractAddressMainnet || null
    : publicEnv.contractAddressSepolia || null;
}

export function getContractDeploymentBlock(chainId = getDefaultChainId()) {
  return chainId === CELO_MAINNET_CHAIN_ID
    ? publicEnv.contractDeploymentBlockMainnet
    : publicEnv.contractDeploymentBlockSepolia;
}

export function resolveContractAddressForChain(
  chainId: number,
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  }
) {
  if (chainId === CELO_MAINNET_CHAIN_ID) {
    return contractAddresses.celo;
  }

  if (chainId === CELO_SEPOLIA_CHAIN_ID) {
    return contractAddresses.celoSepolia;
  }

  return null;
}

export function isSupportedCeloChain(chainId?: number): chainId is number {
  return chainId === CELO_MAINNET_CHAIN_ID || chainId === CELO_SEPOLIA_CHAIN_ID;
}
