import hre from "hardhat";
import { serverEnv } from "../lib/server-env";

async function main() {
  const networkName = hre.globalOptions.network;
  const { ethers } = await hre.network.create();
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
  const tx = await contract.createProgram(
    "Sepolia Barber Club",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    "Free beard trim",
    3,
    true,
    true
  );
  await tx.wait();

  console.log("seeded demo loyalty program");
  console.log("network:", networkName);
  console.log("chainId:", chainId);
  console.log("contract:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
