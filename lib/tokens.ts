import type { Hex } from "viem";
import { CELO_MAINNET_CHAIN_ID, CELO_SEPOLIA_CHAIN_ID } from "./chains";

export type SupportedTokenSymbol = "USDT" | "USDC" | "cUSD";

type SupportedTokenDefinition = {
  symbol: SupportedTokenSymbol;
  name: string;
  decimals: number;
  accent: string;
  addresses: {
    42220: Hex[];
    11142220: Hex[];
  };
};

export type SupportedToken = {
  symbol: SupportedTokenSymbol;
  name: string;
  decimals: number;
  accent: string;
  address: Hex;
  aliases: Hex[];
};

const TOKEN_DEFINITIONS: SupportedTokenDefinition[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    accent: "from-[#7B3FE4] via-[#8B5CF6] to-[#B087F9]",
    addresses: {
      42220: ["0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"],
      11142220: ["0xd077A400968890Eacc75cdc901F0356c943e4fDb"]
    }
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    accent: "from-[#1F6BFF] via-[#4A8DFF] to-[#8CB6FF]",
    addresses: {
      42220: ["0xcebA9300f2b948710d2653dD7B07f33A8B32118C"],
      11142220: ["0x01C5C0122039549AD1493B8220cABEdD739BC44E"]
    }
  },
  {
    symbol: "cUSD",
    name: "Mento Dollar",
    decimals: 18,
    accent: "from-[#1C8C5E] via-[#2CB67D] to-[#7DE2B8]",
    addresses: {
      42220: ["0x765DE816845861e75A25fCA122bb6898B8B1282a"],
      11142220: [
        "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80",
        "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b"
      ]
    }
  }
];

function resolveChainId(chainId = CELO_MAINNET_CHAIN_ID) {
  return chainId === CELO_MAINNET_CHAIN_ID
    ? CELO_MAINNET_CHAIN_ID
    : CELO_SEPOLIA_CHAIN_ID;
}

function resolveToken(token: SupportedTokenDefinition, chainId: number, address?: Hex): SupportedToken {
  const resolvedChainId = resolveChainId(chainId);
  const aliases = token.addresses[resolvedChainId];
  const matchedAddress =
    address && aliases.some((candidate) => candidate.toLowerCase() === address.toLowerCase())
      ? address
      : aliases[0];

  return {
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    accent: token.accent,
    address: matchedAddress,
    aliases
  };
}

export function getSupportedTokens(chainId = CELO_MAINNET_CHAIN_ID) {
  return TOKEN_DEFINITIONS.map((token) => resolveToken(token, chainId));
}

export function getSupportedTokenAddresses(chainId = CELO_MAINNET_CHAIN_ID) {
  return getSupportedTokens(chainId).flatMap((token) => token.aliases);
}

export function getTokenByAddress(address: string, chainId = CELO_MAINNET_CHAIN_ID) {
  for (const token of TOKEN_DEFINITIONS) {
    const resolved = resolveToken(token, chainId);
    if (
      resolved.aliases.some((candidate) => candidate.toLowerCase() === address.toLowerCase())
    ) {
      return resolveToken(token, chainId, address as Hex);
    }
  }

  return undefined;
}

export function getTokenBySymbol(
  symbol: SupportedTokenSymbol,
  chainId = CELO_MAINNET_CHAIN_ID
) {
  const token = TOKEN_DEFINITIONS.find((candidate) => candidate.symbol === symbol);
  return token ? resolveToken(token, chainId) : undefined;
}

export function getPrimaryPaymentToken(chainId = CELO_MAINNET_CHAIN_ID) {
  return getTokenBySymbol("USDT", chainId) || getSupportedTokens(chainId)[0];
}

export function getTokenFromQuery(
  value: string | undefined,
  chainId = CELO_MAINNET_CHAIN_ID
) {
  if (!value) return undefined;

  const bySymbol = getTokenBySymbol(value as SupportedTokenSymbol, chainId);
  if (bySymbol) {
    return bySymbol;
  }

  return getTokenByAddress(value, chainId);
}
