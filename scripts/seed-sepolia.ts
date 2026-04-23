import hre from "hardhat";
import { buildStoreSeeds } from "../lib/catalog";
import { getResolvedStoreCatalog } from "../lib/catalog-server";
import { serverEnv } from "../lib/server-env";

async function main() {
  const networkName = hre.globalOptions.network;
  const { ethers } = await hre.network.create();
  const [deployer] = await ethers.getSigners();
  const connectedNetwork = await ethers.provider.getNetwork();
  const chainId = Number(connectedNetwork.chainId);

  const contractAddress =
    networkName === "celo"
      ? serverEnv.noodl3ContractAddressMainnet
      : serverEnv.noodl3ContractAddressSepolia;

  if (!contractAddress) {
    throw new Error(
      "Missing NOODL3 contract address for this network. Deploy first and set the env."
    );
  }

  const contract = await ethers.getContractAt("Noodl3Loyalty", contractAddress);
  const manager =
    (serverEnv.seedManagerAddress || deployer.address) as `0x${string}`;
  const payout =
    (serverEnv.seedPayoutAddress || deployer.address) as `0x${string}`;
  const seeds = buildStoreSeeds({
    chainId,
    manager,
    payout,
    stores: getResolvedStoreCatalog()
  });

  for (const seed of seeds) {
    const tx = await contract.configureStore(
      seed.storeId,
      seed.payout,
      seed.manager,
      seed.token,
      seed.minPurchaseAmount,
      seed.stampsPerPurchase,
      seed.stampsRequired,
      seed.rewardType,
      seed.rewardValue,
      seed.active
    );
    await tx.wait();

    const acceptedTokensTx = await contract.configureStoreAcceptedTokens(
      seed.storeId,
      seed.acceptedTokens.map((token) => token.address),
      seed.acceptedTokens.map((token) => token.decimals)
    );
    await acceptedTokensTx.wait();
    console.log(`seeded ${seed.slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
