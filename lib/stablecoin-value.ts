import { parseUnits } from "viem";

export const STABLECOIN_VALUE_DECIMALS = 6;

export function normalizeStablecoinValueInput(value: string) {
  const normalizedSeparators = value.replace(/,/g, ".");
  const numericValue = normalizedSeparators.replace(/[^\d.]/g, "");
  const [wholePart, ...fractionParts] = numericValue.split(".");

  if (fractionParts.length === 0) {
    return wholePart;
  }

  return `${wholePart}.${fractionParts.join("").slice(0, STABLECOIN_VALUE_DECIMALS)}`;
}

export function canonicalizeStablecoinValueInput(value: string) {
  const normalized = normalizeStablecoinValueInput(value);

  if (!normalized || normalized === ".") {
    return "";
  }

  const withWholePart = normalized.startsWith(".") ? `0${normalized}` : normalized;

  return withWholePart.endsWith(".") ? withWholePart.slice(0, -1) : withWholePart;
}

export function sanitizeStablecoinDecimalString(value: string, label: string) {
  const separatorNormalized = value.trim().replace(/,/g, ".");
  const withWholePart = separatorNormalized.startsWith(".")
    ? `0${separatorNormalized}`
    : separatorNormalized;
  const canonical = withWholePart.endsWith(".")
    ? withWholePart.slice(0, -1)
    : withWholePart;

  if (!/^\d+(\.\d{1,6})?$/.test(canonical)) {
    throw new Error(`${label} must be a decimal string with up to 6 decimal places.`);
  }

  parseUnits(canonical, 18);
  return canonical;
}
