import type { Hex } from "viem";

export type DefaultChainKey = "celo" | "celoSepolia";

function readPublicVar(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

function readHexOrUndefinedFrom(names: string[]): Hex | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value as Hex;
    }
  }

  return undefined;
}

function readBlockNumberFrom(names: string[]): bigint {
  for (const name of names) {
    const value = process.env[name];
    if (!value) {
      continue;
    }

    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }

  return 0n;
}

export type PublicEnv = {
  appUrl: string;
  defaultChain: DefaultChainKey;
  celoMainnetRpcUrl: string;
  celoSepoliaRpcUrl: string;
  contractAddressMainnet: Hex | undefined;
  contractAddressSepolia: Hex | undefined;
  contractDeploymentBlockMainnet: bigint;
  contractDeploymentBlockSepolia: bigint;
};

export function readPublicEnv(): PublicEnv {
  return {
    appUrl: readPublicVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    defaultChain: (
      process.env.NEXT_PUBLIC_DEFAULT_CHAIN === "celo" ? "celo" : "celoSepolia"
    ) as DefaultChainKey,
    celoMainnetRpcUrl: readPublicVar(
      "NEXT_PUBLIC_CELO_MAINNET_RPC_URL",
      "https://forno.celo.org"
    ),
    celoSepoliaRpcUrl: readPublicVar(
      "NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL",
      "https://forno.celo-sepolia.celo-testnet.org"
    ),
    contractAddressMainnet: readHexOrUndefinedFrom([
      "NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_MAINNET",
      "NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET"
    ]),
    contractAddressSepolia: readHexOrUndefinedFrom([
      "NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA",
      "NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA"
    ]),
    contractDeploymentBlockMainnet: readBlockNumberFrom([
      "NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_MAINNET",
      "NEXT_PUBLIC_CONTRACT_DEPLOYMENT_BLOCK_MAINNET"
    ]),
    contractDeploymentBlockSepolia: readBlockNumberFrom([
      "NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_SEPOLIA",
      "NEXT_PUBLIC_CONTRACT_DEPLOYMENT_BLOCK_SEPOLIA"
    ])
  };
}

export const publicEnv = readPublicEnv();
