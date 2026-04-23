import { parseUnits } from "viem";
import {
  normalizeImageUrl
} from "./format";
import type {
  LocalizedText,
  MenuItem,
  StoreCatalogEntry,
  StoreCatalogInput
} from "./catalog";

export const MERCHANT_PATCH_MAX_AGE_MS = 5 * 60 * 1000;

export type MerchantCatalogStorePatch = {
  name: LocalizedText;
  storeLogoUrl?: string;
  category: LocalizedText;
  city: LocalizedText;
  accent: string;
  summary: LocalizedText;
};

export type MerchantCatalogMenuPatchItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: string;
  badge?: LocalizedText | null;
  archived?: boolean;
};

export type MerchantCatalogPatchPayload = {
  kind: "catalog";
  storeSlug: string;
  submittedAt: string;
  store: MerchantCatalogStorePatch;
  menu: MerchantCatalogMenuPatchItem[];
};

export type MerchantOwnerMirrorPatchPayload = {
  kind: "owner-mirror";
  storeSlug: string;
  submittedAt: string;
  loyalty: StoreCatalogEntry["loyalty"];
  onchain: {
    manager: `0x${string}`;
    payout: `0x${string}`;
    token: `0x${string}`;
    acceptedTokens: `0x${string}`[];
    active: boolean;
  };
};

export type MerchantPatchPayload =
  | MerchantCatalogPatchPayload
  | MerchantOwnerMirrorPatchPayload;

export type MerchantPatchRequest = MerchantPatchPayload & {
  signer: `0x${string}`;
  message: string;
  signature: `0x${string}`;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function buildMerchantPatchMessage(payload: MerchantPatchPayload) {
  return `noodl3 merchant update\n${stableSerialize(payload)}`;
}

function sanitizeRequiredText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}

function sanitizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed || undefined;
}

function sanitizeLocalizedText(value: LocalizedText, label: string): LocalizedText {
  return {
    "pt-BR": sanitizeRequiredText(value["pt-BR"], `${label} (pt-BR)`),
    en: sanitizeRequiredText(value.en, `${label} (en)`)
  };
}

function sanitizeOptionalLocalizedText(value?: LocalizedText | null, label?: string) {
  if (!value) {
    return null;
  }

  return sanitizeLocalizedText(value, label || "Text");
}

function sanitizeDecimalString(value: string, label: string) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`${label} must be a decimal string.`);
  }

  parseUnits(trimmed, 18);
  return trimmed;
}

function sanitizeItemId(value: string) {
  const trimmed = value.trim();
  if (!/^[a-z0-9][a-z0-9-_]{0,63}$/.test(trimmed)) {
    throw new Error("Menu item id must use lowercase letters, numbers, dashes, or underscores.");
  }

  return trimmed;
}

function sanitizeCatalogPatchItem(item: MerchantCatalogMenuPatchItem): MenuItem {
  return {
    id: sanitizeItemId(item.id),
    name: sanitizeLocalizedText(item.name, "Menu name"),
    description: sanitizeLocalizedText(item.description, "Menu description"),
    price: sanitizeDecimalString(item.price, "Menu price"),
    badge: sanitizeOptionalLocalizedText(item.badge, "Menu badge"),
    archived: Boolean(item.archived)
  };
}

export function assertMerchantPatchFresh(submittedAt: string) {
  const submittedAtMs = Date.parse(submittedAt);
  if (!Number.isFinite(submittedAtMs)) {
    throw new Error("Invalid submission timestamp.");
  }

  if (Math.abs(Date.now() - submittedAtMs) > MERCHANT_PATCH_MAX_AGE_MS) {
    throw new Error("Merchant approval expired. Please sign again.");
  }
}

export function sanitizeCatalogPatch(
  stores: StoreCatalogEntry[],
  payload: MerchantCatalogPatchPayload
) {
  const currentStore = stores.find((store) => store.slug === payload.storeSlug);
  if (!currentStore) {
    throw new Error("Store not found.");
  }

  const menu = payload.menu.map(sanitizeCatalogPatchItem);
  const nextMenuIds = new Set<string>();
  for (const item of menu) {
    if (nextMenuIds.has(item.id)) {
      throw new Error(`Duplicate menu item id: ${item.id}`);
    }
    nextMenuIds.add(item.id);
  }

  for (const item of currentStore.menu) {
    if (!nextMenuIds.has(item.id)) {
      throw new Error(`Existing menu item ${item.id} must be archived instead of removed.`);
    }
  }

  return {
    currentStore,
    nextStorePatch: {
      name: sanitizeLocalizedText(payload.store.name, "Store name"),
      storeLogoUrl: sanitizeOptionalText(
        normalizeImageUrl(payload.store.storeLogoUrl || "")
      ),
      category: sanitizeLocalizedText(payload.store.category, "Store category"),
      city: sanitizeLocalizedText(payload.store.city, "Store city"),
      accent: sanitizeRequiredText(payload.store.accent, "Store accent"),
      summary: sanitizeLocalizedText(payload.store.summary, "Store summary"),
      menu
    }
  };
}

export function applyMerchantCatalogPatch(
  stores: StoreCatalogEntry[],
  payload: MerchantCatalogPatchPayload
) {
  const { currentStore, nextStorePatch } = sanitizeCatalogPatch(stores, payload);

  return stores.map((store) =>
    store.slug !== currentStore.slug
      ? store
      : {
          ...store,
          name: nextStorePatch.name,
          storeLogoUrl: nextStorePatch.storeLogoUrl,
          category: nextStorePatch.category,
          city: nextStorePatch.city,
          accent: nextStorePatch.accent,
          summary: nextStorePatch.summary,
          menu: nextStorePatch.menu
        }
  );
}

export function sanitizeOwnerMirrorPatch(payload: MerchantOwnerMirrorPatchPayload) {
  const minimumPurchase = sanitizeDecimalString(
    payload.loyalty.minimumPurchase,
    "Minimum purchase"
  );
  const rewardValue = sanitizeDecimalString(payload.loyalty.rewardValue, "Reward value");

  if (payload.loyalty.stampsPerPurchase < 1 || payload.loyalty.stampsRequired < 1) {
    throw new Error("Stamp configuration must be greater than zero.");
  }

  if (payload.onchain.acceptedTokens.length === 0) {
    throw new Error("At least one accepted token is required.");
  }

  return {
    loyalty: {
      ...payload.loyalty,
      minimumPurchase,
      rewardValue
    },
    onchain: {
      ...payload.onchain
    }
  };
}

export function applyOwnerMirrorPatch(
  stores: StoreCatalogEntry[],
  payload: MerchantOwnerMirrorPatchPayload
) {
  const nextPatch = sanitizeOwnerMirrorPatch(payload);

  return stores.map((store) =>
    store.slug !== payload.storeSlug
      ? store
      : {
          ...store,
          loyalty: {
            ...nextPatch.loyalty
          },
          onchain: {
            ...store.onchain,
            manager: nextPatch.onchain.manager,
            payout: nextPatch.onchain.payout,
            token: nextPatch.onchain.token,
            acceptedTokens: [...nextPatch.onchain.acceptedTokens]
          }
        }
  );
}

export function serializeStoreCatalogForEnv(stores: StoreCatalogEntry[]) {
  return JSON.stringify(
    stores.map<StoreCatalogInput>((store) => ({
      slug: store.slug,
      shortCode: store.shortCode,
      name: store.name,
      store_logo_url: store.storeLogoUrl,
      category: store.category,
      city: store.city,
      accent: store.accent,
      summary: store.summary,
      loyalty: {
        ...store.loyalty
      },
      menu: store.menu.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        badge: item.badge ?? undefined,
        archived: item.archived
      })),
      onchain: store.onchain
        ? {
            payout: store.onchain.payout,
            manager: store.onchain.manager,
            token: store.onchain.token,
            acceptedTokens: store.onchain.acceptedTokens
          }
        : undefined
    }))
  );
}
