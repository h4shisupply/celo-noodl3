import { buildDashboardUrl } from "./dashboard-route";
import type { StoreCatalogEntry } from "./catalog";

export function buildPurchaseUrl(appUrl: string, storeSlug: string, itemId: string) {
  const url = new URL(`/app/store/${storeSlug}`, appUrl);
  url.searchParams.set("item", itemId);
  url.searchParams.set("via", "qr");
  return url.toString();
}

export function buildClaimUrl(appUrl: string, claimId: bigint | number) {
  const url = new URL(
    buildDashboardUrl({
      role: "merchant",
      scanner: "claim",
      claim: claimId.toString()
    }),
    appUrl
  );
  return url.toString();
}

export function buildQrImageUrl(value: string, size = 320) {
  const url = new URL("https://api.qrserver.com/v1/create-qr-code/");
  url.searchParams.set("size", `${size}x${size}`);
  url.searchParams.set("data", value);
  url.searchParams.set("margin", "0");
  return url.toString();
}

export function buildClaimCode(
  store: Pick<StoreCatalogEntry, "shortCode">,
  claimId: bigint | number
) {
  return `${store.shortCode}-${claimId.toString().padStart(4, "0")}`;
}

export function parseClaimInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const claimParam = url.searchParams.get("claim");
    if (claimParam) {
      return BigInt(claimParam);
    }

    const matchFromPath = url.pathname.match(/\/claim\/(\d+)$/);
    if (matchFromPath) {
      return BigInt(matchFromPath[1]);
    }
  } catch {
    // Fall through to plain text.
  }

  const match = trimmed.match(/(\d+)/g);
  if (!match || match.length === 0) return null;
  return BigInt(match[match.length - 1]);
}

export function formatWalletLabel(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
