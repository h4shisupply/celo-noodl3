import {
  DEFAULT_STORE_CATALOG,
  findStoreBySlug,
  normalizeStoreCatalog,
  type StoreCatalogEntry,
  type StoreCatalogInput
} from "./catalog";
import { publicEnv } from "./env";
import { serverEnv } from "./server-env";

function withResolvedOnchainDefaults(stores: StoreCatalogEntry[]) {
  return stores.map((store) => ({
    ...store,
    onchain: {
      payout:
        store.onchain?.payout ||
        (serverEnv.seedPayoutAddress
          ? (serverEnv.seedPayoutAddress as `0x${string}`)
          : undefined),
      manager:
        store.onchain?.manager ||
        (serverEnv.seedManagerAddress
          ? (serverEnv.seedManagerAddress as `0x${string}`)
          : undefined),
      token: store.onchain?.token
    }
  }));
}

function parseCatalogFromEnv(
  rawValue: string,
  options?: {
    required?: boolean;
  }
): StoreCatalogEntry[] {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("NOODL3_STORE_CATALOG_JSON must be a JSON array.");
    }

    return withResolvedOnchainDefaults(
      normalizeStoreCatalog(parsed as StoreCatalogInput[])
    );
  } catch (error) {
    if (options?.required) {
      throw new Error(
        "Invalid NOODL3_STORE_CATALOG_JSON. A valid store catalog JSON is required for mainnet.",
        {
          cause: error
        }
      );
    }

    console.warn("Invalid NOODL3_STORE_CATALOG_JSON. Falling back to defaults.", error);
    return withResolvedOnchainDefaults(DEFAULT_STORE_CATALOG);
  }
}

export function getResolvedStoreCatalog() {
  const rawValue = serverEnv.noodl3StoreCatalogJson.trim();
  const requireExplicitCatalog = publicEnv.defaultChain === "celo";

  if (!rawValue) {
    if (requireExplicitCatalog) {
      throw new Error(
        "NOODL3_STORE_CATALOG_JSON is required when NEXT_PUBLIC_DEFAULT_CHAIN=celo."
      );
    }

    return withResolvedOnchainDefaults(DEFAULT_STORE_CATALOG);
  }

  return parseCatalogFromEnv(rawValue, {
    required: requireExplicitCatalog
  });
}

export function getResolvedStoreBySlug(slug: string) {
  return findStoreBySlug(getResolvedStoreCatalog(), slug);
}
