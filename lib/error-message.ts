"use client";

import { getRuntimeDictionary } from "./i18n";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (typeof error === "string") {
    return error.trim();
  }

  return "";
}

function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "number"
  ) {
    return Number((error as { code: number }).code);
  }

  return undefined;
}

export function getUserFacingErrorMessage(error: unknown, fallback?: string) {
  const dictionary = getRuntimeDictionary();
  const raw = getErrorMessage(error);
  const normalized = raw.toLowerCase();
  const code = getErrorCode(error);
  const fallbackMessage = fallback || dictionary.messages.genericActionFailed;

  if (!raw) {
    return fallbackMessage;
  }

  if (
    code === 4001 ||
    normalized.includes("user rejected") ||
    normalized.includes("user denied") ||
    normalized.includes("rejected the request") ||
    normalized.includes("cancelled")
  ) {
    return dictionary.messages.walletActionRejected;
  }

  if (
    normalized.includes("troque sua carteira") ||
    normalized.includes("switch your wallet") ||
    normalized.includes("abra o app em") ||
    normalized.includes("open the app in") ||
    normalized === dictionary.messages.noWalletFound.toLowerCase()
  ) {
    return raw;
  }

  if (
    normalized.includes("insufficient funds") ||
    normalized.includes("insufficient balance") ||
    normalized.includes("transfer amount exceeds balance") ||
    normalized.includes("erc20: transfer amount exceeds balance") ||
    normalized.includes("saldo insuficiente")
  ) {
    return dictionary.messages.insufficientBalance;
  }

  if (
    normalized.includes("insufficientstamps") ||
    normalized.includes("not enough stamps") ||
    normalized.includes("insufficient stamps")
  ) {
    return dictionary.messages.notEnoughStamps;
  }

  if (
    (normalized.includes("display name") ||
      normalized.includes("avatar") ||
      normalized.includes("profile") ||
      normalized.includes("invalidprofile")) &&
    (normalized.includes("https") ||
      normalized.includes("invalid") ||
      normalized.includes("required"))
  ) {
    return dictionary.messages.invalidProfileInput;
  }

  if (
    normalized.includes("does not support onchain profiles") ||
    normalized.includes("support onchain profiles")
  ) {
    return dictionary.messages.profileContractOutdated;
  }

  if (
    normalized.includes("rpc error") ||
    normalized.includes("json-rpc") ||
    normalized.includes("call_exception") ||
    normalized.includes("execution reverted") ||
    normalized.includes("unknown error") ||
    raw.length > 140
  ) {
    return fallbackMessage;
  }

  return raw;
}
