import fs from "node:fs";
import path from "node:path";

async function main() {
  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/Noodl3Loyalty.sol/Noodl3Loyalty.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const output = `export const loyaltyAbi = ${JSON.stringify(
    artifact.abi,
    null,
    2
  )} as const;\n\nexport const erc20Abi = [\n  {\n    type: "function",\n    name: "allowance",\n    stateMutability: "view",\n    inputs: [\n      { name: "owner", type: "address", internalType: "address" },\n      { name: "spender", type: "address", internalType: "address" }\n    ],\n    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]\n  },\n  {\n    type: "function",\n    name: "approve",\n    stateMutability: "nonpayable",\n    inputs: [\n      { name: "spender", type: "address", internalType: "address" },\n      { name: "amount", type: "uint256", internalType: "uint256" }\n    ],\n    outputs: [{ name: "", type: "bool", internalType: "bool" }]\n  },\n  {\n    type: "function",\n    name: "balanceOf",\n    stateMutability: "view",\n    inputs: [{ name: "owner", type: "address", internalType: "address" }],\n    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]\n  }\n] as const;\n`;

  fs.writeFileSync(path.join(process.cwd(), "lib/abi.ts"), output);
  console.log("ABI exported to lib/abi.ts");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
