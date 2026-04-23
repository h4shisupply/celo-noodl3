import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();
  const connectedNetwork = await ethers.provider.getNetwork();
  const chainId = Number(connectedNetwork.chainId);
  const contract = await ethers.deployContract("Noodl3Loyalty");
  await contract.waitForDeployment();

  console.log("Noodl3Loyalty deployed");
  console.log("network:", hre.globalOptions.network);
  console.log("chainId:", chainId);
  console.log("address:", await contract.getAddress());
  console.log("owner:", await contract.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
