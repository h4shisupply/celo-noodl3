export type DashboardRole = "customer" | "merchant";
export type DashboardCustomerTab = "loyalty" | "rewards" | "stores";
export type DashboardMerchantTab = "users" | "rewards" | "catalog" | "onchain";
export type DashboardTab = DashboardCustomerTab | DashboardMerchantTab;
export type DashboardScanner = "purchase" | "claim";

export type DashboardQueryState = {
  role?: DashboardRole;
  tab?: DashboardTab;
  scanner?: DashboardScanner;
  claim?: string;
};

export function normalizeDashboardRole(value?: string | null): DashboardRole | undefined {
  if (value === "customer" || value === "merchant") {
    return value;
  }

  return undefined;
}

export function normalizeDashboardTab(value?: string | null): DashboardTab | undefined {
  if (
    value === "loyalty" ||
    value === "rewards" ||
    value === "stores" ||
    value === "users" ||
    value === "catalog" ||
    value === "onchain"
  ) {
    return value;
  }

  return undefined;
}

export function normalizeDashboardScanner(
  value?: string | null
): DashboardScanner | undefined {
  if (value === "purchase" || value === "claim") {
    return value;
  }

  return undefined;
}

export function buildDashboardUrl(state: DashboardQueryState) {
  const params = new URLSearchParams();

  if (state.role) {
    params.set("role", state.role);
  }

  if (state.tab) {
    params.set("tab", state.tab);
  }

  if (state.scanner) {
    params.set("scanner", state.scanner);
  }

  if (state.claim) {
    params.set("claim", state.claim);
  }

  return `/app${params.size > 0 ? `?${params.toString()}` : ""}`;
}
