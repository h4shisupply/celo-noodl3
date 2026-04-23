import hre from "hardhat";
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import { serverEnv } from "../lib/server-env";

function getContractAddressForNetwork(networkName: string) {
  if (networkName === "celo") {
    return serverEnv.noodl3ContractAddressMainnet;
  }

  if (networkName === "celoSepolia") {
    return serverEnv.noodl3ContractAddressSepolia;
  }

  return undefined;
}

function getVerificationProviderForNetwork(networkName: string) {
  if (networkName === "celo") {
    return "etherscan" as const;
  }

  if (networkName === "celoSepolia") {
    return "blockscout" as const;
  }

  return undefined;
}

async function main() {
  const networkName = hre.globalOptions.network;
  const address = getContractAddressForNetwork(networkName);
  const provider = getVerificationProviderForNetwork(networkName);

  if (!address) {
    throw new Error(
      `Missing contract address env for ${networkName}. Set NOODL3_CONTRACT_ADDRESS_MAINNET or NOODL3_CONTRACT_ADDRESS_SEPOLIA.`
    );
  }

  if (!provider) {
    throw new Error(`Unsupported verification network: ${networkName}`);
  }

  await verifyContract(
    {
      address,
      constructorArgs: [],
      provider
    },
    hre
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
