import fs from "node:fs";
import path from "node:path";

const artifactPath = path.join(
  process.cwd(),
  "artifacts/contracts/Noodl3Loyalty.sol/Noodl3Loyalty.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const erc20Abi = `export const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
  }
] as const;
`;

fs.writeFileSync(
  path.join(process.cwd(), "lib/abi.ts"),
  `export const loyaltyAbi = ${JSON.stringify(artifact.abi, null, 2)} as const;\n\n${erc20Abi}`
);
console.log("ABI exported to lib/abi.ts");
