import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const config = [
  {
    ignores: [
      ".home/**",
      ".next/**",
      "artifacts/**",
      "cache/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "out/**",
      "typechain-types/**",
      "types/ethers-contracts/**"
    ]
  },
  ...compat.config({
    extends: ["next/core-web-vitals"]
  })
];

export default config;
