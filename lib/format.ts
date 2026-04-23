import { formatUnits } from "viem";
import type { SupportedTokenSymbol } from "./tokens";
import { getTokenByAddress } from "./tokens";
import {
  getRuntimeDictionary,
  type Locale
} from "./i18n";

export function shortenAddress(address?: string | null) {
  if (!address) return getRuntimeDictionary().common.disconnected;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount: bigint, tokenAddress: string, chainId: number) {
  const token = getTokenByAddress(tokenAddress, chainId);
  if (!token) return amount.toString();

  const formatted = Number(formatUnits(amount, token.decimals));
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: token.decimals === 18 ? 4 : 2
  }).format(formatted);
}

export function formatDateLabel(
  timestamp: number,
  locale: Locale = "en"
) {
  const resolvedLocale = locale === "pt-BR" ? "pt-BR" : "en-US";

  return new Intl.DateTimeFormat(resolvedLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(timestamp * 1000));
}

export function sanitizeHandleInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
}

export function buildShareUrl(
  baseUrl: string,
  handle: string,
  amount?: string,
  reference?: string,
  token?: SupportedTokenSymbol | string
) {
  const url = new URL(`/u/${handle}`, baseUrl);

  if (amount) {
    url.searchParams.set("amount", amount);
  }

  if (reference) {
    url.searchParams.set("ref", reference);
  }

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

export function sanitizeCurrencyInput(
  value?: string | string[],
  maxDecimals = 2,
  maxWholeDigits = 12
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "";

  const cleaned = candidate.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const firstDotIndex = cleaned.indexOf(".");
  const hasDot = firstDotIndex >= 0;
  const wholePartRaw =
    firstDotIndex >= 0 ? cleaned.slice(0, firstDotIndex) : cleaned;
  const decimalPartRaw =
    firstDotIndex >= 0
      ? cleaned.slice(firstDotIndex + 1).replace(/\./g, "")
      : "";

  const wholePart = wholePartRaw.slice(0, maxWholeDigits);
  const decimalPart = decimalPartRaw.slice(0, maxDecimals);

  if (!hasDot) {
    return wholePart;
  }

  return `${wholePart || "0"}.${decimalPart}`;
}

export function safeAmountInput(value?: string | string[]) {
  return sanitizeCurrencyInput(value);
}

export function safeTextQuery(value?: string | string[]) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "";

  return candidate
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, 140);
}

export function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "PL";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  return normalizeRemoteImageUrl(trimmed);
}

export function normalizeRemoteImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "https:") {
      return "";
    }

    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}
