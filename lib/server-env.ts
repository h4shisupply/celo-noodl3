export type ServerEnv = {
  privateKey: string;
  etherscanApiKey: string;
  celoscanApiKey: string;
  celoMainnetRpcUrl: string;
  celoSepoliaRpcUrl: string;
  noodl3ContractAddressMainnet: string;
  noodl3ContractAddressSepolia: string;
  seedManagerAddress: string;
  seedPayoutAddress: string;
  noodl3StoreCatalogJson: string;
  vercelAccessToken: string;
  vercelProjectId: string;
  vercelTeamId: string;
};

function readServerVar(name: string, fallback = "") {
  return process.env[name] || fallback;
}

export function readServerEnv(): ServerEnv {
  return {
    privateKey: readServerVar("PRIVATE_KEY"),
    etherscanApiKey: readServerVar("ETHERSCAN_API_KEY"),
    celoscanApiKey: readServerVar("CELOSCAN_API_KEY"),
    celoMainnetRpcUrl: readServerVar("CELO_MAINNET_RPC_URL", "https://forno.celo.org"),
    celoSepoliaRpcUrl: readServerVar(
      "CELO_SEPOLIA_RPC_URL",
      "https://forno.celo-sepolia.celo-testnet.org"
    ),
    noodl3ContractAddressMainnet: readServerVar("NOODL3_CONTRACT_ADDRESS_MAINNET"),
    noodl3ContractAddressSepolia: readServerVar("NOODL3_CONTRACT_ADDRESS_SEPOLIA"),
    seedManagerAddress: readServerVar("NOODL3_SEED_MANAGER_ADDRESS"),
    seedPayoutAddress: readServerVar("NOODL3_SEED_PAYOUT_ADDRESS"),
    noodl3StoreCatalogJson: readServerVar("NOODL3_STORE_CATALOG_JSON"),
    vercelAccessToken: readServerVar("VERCEL_ACCESS_TOKEN"),
    vercelProjectId: readServerVar("VERCEL_PROJECT_ID"),
    vercelTeamId: readServerVar("VERCEL_TEAM_ID")
  };
}

export const serverEnv = readServerEnv();
