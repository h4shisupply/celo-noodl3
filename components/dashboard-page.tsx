"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { AppChrome } from "./app-chrome";
import { ProgressMeter } from "./progress-meter";
import { QrScanner } from "./qr-scanner";
import { useLocale } from "./locale-provider";
import { StoreLogo } from "./store-logo";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HeadlessSelect } from "./ui/headless-select";
import { Input } from "./ui/input";
import {
  buildRewardCopy,
  buildStampRuleCopy,
  findStoreBySlug,
  resolveText,
  type StoreCatalogEntry
} from "../lib/catalog";
import {
  buildClaimCode,
  formatWalletLabel,
  parseClaimInput
} from "../lib/claim-code";
import { resolveContractAddressForChain } from "../lib/chains";
import {
  buildDashboardUrl,
  normalizeDashboardRole,
  normalizeDashboardScanner,
  normalizeDashboardTab,
  type DashboardRole
} from "../lib/dashboard-route";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { formatDateLabel, getInitials } from "../lib/format";
import { useMiniPay } from "../lib/minipay";
import { useProfile } from "../lib/profile";
import {
  decodeStoreId,
  encodeStoreId
} from "../lib/store-id";
import { useAutoDismissMessage } from "../lib/use-auto-dismiss-message";
import {
  claimRewardTx,
  consumeRewardTx,
  extractClaimIdFromReceipt,
  waitForTransaction
} from "../lib/wallet";
import {
  fetchClaim,
  fetchProfile,
  fetchProgress,
  fetchStore,
  fetchStoreClaimIds,
  fetchStoreParticipants,
  fetchUserClaimIds,
  type ClaimRecord,
  type StoreRecord,
  type UserProfileRecord
} from "../lib/contract";

type CustomerSummary = {
  address: Hex;
  stamps: number;
  stampsRequired: number;
  canClaim: boolean;
  profile: UserProfileRecord | null;
};

type ProfileModalMode = "setup" | "edit" | null;

export function DashboardPage({
  stores,
  initialChainId,
  contractAddresses
}: {
  stores: StoreCatalogEntry[];
  initialChainId: number;
  contractAddresses: {
    celo: Hex | null;
    celoSepolia: Hex | null;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [progressBySlug, setProgressBySlug] = useState<Record<string, number>>({});
  const [claimableBySlug, setClaimableBySlug] = useState<Record<string, boolean>>({});
  const [customerClaims, setCustomerClaims] = useState<ClaimRecord[]>([]);
  const [selectedStoreSlug, setSelectedStoreSlug] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Hex | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [merchantClaims, setMerchantClaims] = useState<ClaimRecord[]>([]);
  const [isLoadingMerchantData, setIsLoadingMerchantData] = useState(false);
  const [claimInputValue, setClaimInputValue] = useState(searchParams.get("claim") ?? "");
  const [claimId, setClaimId] = useState<bigint | null>(null);
  const [claimRecord, setClaimRecord] = useState<ClaimRecord | null>(null);
  const [claimStoreRecord, setClaimStoreRecord] = useState<StoreRecord | null>(null);
  const [claimLookupError, setClaimLookupError] = useState<string | null>(null);
  const [claimScannerNotice, setClaimScannerNotice] = useState<string | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);
  const [claimingSlug, setClaimingSlug] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profileModalMode, setProfileModalMode] = useState<ProfileModalMode>(null);
  const [profileName, setProfileName] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const {
    account,
    chainId,
    expectedChainId,
    expectedChainLabel,
    hasProvider,
    isMiniPay,
    isConnecting,
    isDisconnectedByUser,
    isWrongChain,
    connect,
    switchToDefaultChain,
    refreshWalletState,
    disconnect,
    connectError,
    clearConnectError
  } = useMiniPay(initialChainId);
  const contractAddress = useMemo(
    () => resolveContractAddressForChain(initialChainId, contractAddresses),
    [contractAddresses, initialChainId]
  );
  const {
    profile,
    hasSeenPrompt,
    isSaving: isSavingProfile,
    profileError,
    clearProfileError,
    saveProfile,
    dismissProfilePrompt
  } = useProfile(account, initialChainId, contractAddress, {
    enabled: !isWrongChain
  });
  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);
  const clearClaimLookupError = useCallback(() => {
    setClaimLookupError(null);
  }, []);

  useAutoDismissMessage(actionError, clearActionError);
  useAutoDismissMessage(claimLookupError, clearClaimLookupError);
  useAutoDismissMessage(connectError, clearConnectError);
  useAutoDismissMessage(profileError, clearProfileError);

  const explicitRole = normalizeDashboardRole(searchParams.get("role"));
  const explicitTab = normalizeDashboardTab(searchParams.get("tab"));
  const explicitScanner = normalizeDashboardScanner(searchParams.get("scanner"));
  const claimParam = searchParams.get("claim") ?? undefined;

  const managedStores = useMemo(() => {
    if (!account) return [];

    return stores.filter(
      (candidate) =>
        candidate.onchain?.manager &&
        candidate.onchain.manager.toLowerCase() === account.toLowerCase()
    );
  }, [account, stores]);

  const managerMode = managedStores.length > 0;
  const role: DashboardRole = explicitRole ?? (managerMode ? "merchant" : "customer");
  const activeTab =
    explicitTab && isTabAllowedForRole(explicitTab, role)
      ? explicitTab
      : role === "merchant"
        ? "users"
        : "loyalty";
  const activeScanner = explicitScanner;

  const selectedManagedStore = useMemo(() => {
    if (!managerMode) return null;

    return (
      managedStores.find((candidate) => candidate.slug === selectedStoreSlug) ??
      managedStores[0] ??
      null
    );
  }, [managedStores, managerMode, selectedStoreSlug]);

  useEffect(() => {
    if (!managerMode) {
      setSelectedStoreSlug("");
      return;
    }

    setSelectedStoreSlug((current) =>
      managedStores.some((candidate) => candidate.slug === current)
        ? current
        : managedStores[0]?.slug ?? ""
    );
  }, [managedStores, managerMode]);

  useEffect(() => {
    if (!account || isWrongChain) {
      setProfileModalMode(null);
      return;
    }

    if (!profile && !hasSeenPrompt) {
      setProfileModalMode("setup");
    }
  }, [account, hasSeenPrompt, isWrongChain, profile]);

  useEffect(() => {
    if (!profileModalMode) return;

    setProfileName(profile?.displayName ?? "");
    setProfileAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile, profileModalMode]);

  useEffect(() => {
    setClaimInputValue(claimParam ?? "");
  }, [claimParam]);

  useEffect(() => {
    async function loadCustomerData() {
      if (!account || !contractAddress || isWrongChain) {
        setProgressBySlug({});
        setClaimableBySlug({});
        setCustomerClaims([]);
        return;
      }

      const [progressEntries, userClaimIds] = await Promise.all([
        Promise.all(
          stores.map(async (store) => {
            const progress = await fetchProgress(
              account,
              encodeStoreId(store.slug),
              initialChainId,
              contractAddress
            );

            return {
              slug: store.slug,
              stamps: progress?.stamps ?? 0,
              canClaim: progress?.canClaim ?? false
            };
          })
        ),
        fetchUserClaimIds(account, initialChainId, contractAddress)
      ]);

      const claimRecords = (
        await Promise.all(
          [...userClaimIds]
            .sort((left, right) => Number(right - left))
            .map((id) => fetchClaim(id, initialChainId, contractAddress))
        )
      ).filter(Boolean) as ClaimRecord[];

      setProgressBySlug(
        Object.fromEntries(progressEntries.map((entry) => [entry.slug, entry.stamps]))
      );
      setClaimableBySlug(
        Object.fromEntries(progressEntries.map((entry) => [entry.slug, entry.canClaim]))
      );
      setCustomerClaims(claimRecords);
    }

    void loadCustomerData();
  }, [account, contractAddress, initialChainId, isWrongChain, stores]);

  useEffect(() => {
    async function loadMerchantData() {
      if (!selectedManagedStore || !contractAddress || !managerMode || isWrongChain) {
        setCustomers([]);
        setMerchantClaims([]);
        return;
      }

      setIsLoadingMerchantData(true);

      try {
        const storeId = encodeStoreId(selectedManagedStore.slug);
        const [participants, claimIds] = await Promise.all([
          fetchStoreParticipants(storeId, initialChainId, contractAddress),
          fetchStoreClaimIds(storeId, initialChainId, contractAddress)
        ]);

        const progressRows = await Promise.all(
          participants.map(async (address) => {
            const [progress, customerProfile] = await Promise.all([
              fetchProgress(address, storeId, initialChainId, contractAddress),
              fetchProfile(address, initialChainId, contractAddress)
            ]);

            return {
              address,
              stamps: progress?.stamps ?? 0,
              stampsRequired:
                progress?.stampsRequired ?? selectedManagedStore.loyalty.stampsRequired,
              canClaim: progress?.canClaim ?? false,
              profile: customerProfile
            } satisfies CustomerSummary;
          })
        );

        const resolvedClaims = (
          await Promise.all(
            [...claimIds]
              .sort((left, right) => Number(right - left))
              .map((id) => fetchClaim(id, initialChainId, contractAddress))
          )
        ).filter(Boolean) as ClaimRecord[];

        setCustomers(
          progressRows.sort((left, right) => {
            if (left.canClaim !== right.canClaim) {
              return left.canClaim ? -1 : 1;
            }

            return right.stamps - left.stamps;
          })
        );
        setMerchantClaims(resolvedClaims);
      } finally {
        setIsLoadingMerchantData(false);
      }
    }

    void loadMerchantData();
  }, [contractAddress, initialChainId, isWrongChain, managerMode, selectedManagedStore]);

  useEffect(() => {
    setSelectedCustomer(null);
    setClaimLookupError(null);
    setClaimScannerNotice(null);
    setClaimId(null);
    setClaimRecord(null);
    setClaimStoreRecord(null);
  }, [selectedStoreSlug]);
  useEffect(() => {
    if (activeScanner !== "claim") {
      setClaimScannerNotice(null);
    }
  }, [activeScanner]);

  const replaceDashboardState = useCallback(
    (nextState: {
      role?: DashboardRole;
      tab?: string;
      scanner?: string;
      claim?: string;
    }) => {
      const href = buildDashboardUrl({
        role:
          "role" in nextState
            ? normalizeDashboardRole(nextState.role)
            : explicitRole,
        tab:
          "tab" in nextState
            ? normalizeDashboardTab(nextState.tab)
            : explicitTab,
        scanner:
          "scanner" in nextState
            ? normalizeDashboardScanner(nextState.scanner)
            : explicitScanner,
        claim: "claim" in nextState ? nextState.claim || undefined : claimParam
      });

      router.replace(href);
    },
    [claimParam, explicitRole, explicitScanner, explicitTab, router]
  );

  const lookupClaim = useCallback(
    async (
      rawValue: string,
      options?: {
        source?: "manual" | "scanner" | "link";
      }
    ) => {
      const isScannerLookup = options?.source === "scanner";
      const showLookupError = (message: string) => {
        if (isScannerLookup) {
          setClaimScannerNotice(message);
          return false;
        }

        setClaimLookupError(message);
        return false;
      };
      const parsed = parseClaimInput(rawValue);
      if (parsed === null) {
        setClaimId(null);
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(locale === "pt-BR" ? "Claim inválido." : "Invalid claim.");
      }

      if (!contractAddress) {
        return showLookupError(
          locale === "pt-BR"
            ? "Contrato indisponível nesta rede."
            : "Contract unavailable on this network."
        );
      }

      if (account && isWrongChain) {
        return showLookupError(
          locale === "pt-BR"
            ? `Troque sua carteira para ${expectedChainLabel} antes de continuar.`
            : `Switch your wallet to ${expectedChainLabel} before continuing.`
        );
      }

      setClaimLookupError(null);
      setClaimScannerNotice(null);
      setClaimId(parsed);

      const nextClaimRecord = await fetchClaim(parsed, initialChainId, contractAddress);
      if (!nextClaimRecord) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(
          locale === "pt-BR" ? "Resgate não encontrado." : "Claim not found."
        );
      }

      const nextStoreRecord = await fetchStore(nextClaimRecord.storeId, initialChainId, contractAddress);
      if (!nextStoreRecord) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(locale === "pt-BR" ? "Loja não encontrada." : "Store not found.");
      }

      if (selectedManagedStore) {
        const selectedStoreId = encodeStoreId(selectedManagedStore.slug).toLowerCase();
        if (nextClaimRecord.storeId.toLowerCase() !== selectedStoreId) {
          setClaimRecord(null);
          setClaimStoreRecord(null);
          return showLookupError(
            locale === "pt-BR"
              ? "Este resgate pertence a outra loja."
              : "This claim belongs to another store."
          );
        }
      }

      if (
        selectedCustomer &&
        nextClaimRecord.user.toLowerCase() !== selectedCustomer.toLowerCase()
      ) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(
          locale === "pt-BR"
            ? "Este resgate pertence a outro cliente."
            : "This claim belongs to another customer."
        );
      }

      setClaimRecord(nextClaimRecord);
      setClaimStoreRecord(nextStoreRecord);

      if (nextClaimRecord.consumed) {
        setClaimLookupError(
          locale === "pt-BR"
            ? "Este resgate já foi utilizado."
            : "This claim has already been used."
        );
      }

      return true;
    },
    [account, contractAddress, expectedChainLabel, initialChainId, isWrongChain, locale, selectedCustomer, selectedManagedStore]
  );

  useEffect(() => {
    if (claimParam) {
      void lookupClaim(claimParam, { source: "link" });
    }
  }, [claimParam, lookupClaim]);

  const totalCurrentStamps = Object.values(progressBySlug).reduce(
    (sum, current) => sum + current,
    0
  );
  const loyaltyStores = useMemo(
    () =>
      stores.filter((store) => {
        const stamps = progressBySlug[store.slug] ?? 0;
        return stamps > 0;
      }),
    [progressBySlug, stores]
  );
  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return stores;

    return stores.filter((store) => {
      const haystack = [
        resolveText(store.name, locale),
        resolveText(store.category, locale),
        resolveText(store.city, locale),
        resolveText(store.summary, locale)
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [locale, query, stores]);
  const filteredCustomers = useMemo(() => {
    const normalizedQuery = customerQuery.trim().toLowerCase();
    if (!normalizedQuery) return customers;

    return customers.filter((customer) => {
      const customerName = customer.profile?.displayName?.toLowerCase() ?? "";
      return (
        customer.address.toLowerCase().includes(normalizedQuery) ||
        customerName.includes(normalizedQuery)
      );
    });
  }, [customerQuery, customers]);
  const customerByAddress = useMemo(
    () =>
      Object.fromEntries(
        customers.map((customer) => [customer.address.toLowerCase(), customer] as const)
      ),
    [customers]
  );
  const selectedCustomerSummary = selectedCustomer
    ? customerByAddress[selectedCustomer.toLowerCase()]
    : undefined;
  const activeUserCount = customers.filter((customer) => customer.stamps > 0).length;
  const claimStoreMeta = useMemo(() => {
    if (!claimStoreRecord) {
      return selectedManagedStore ?? null;
    }

    return findStoreBySlug(stores, decodeStoreId(claimStoreRecord.storeId)) ?? null;
  }, [claimStoreRecord, selectedManagedStore, stores]);
  const isAuthorizedManager =
    account && claimStoreRecord
      ? account.toLowerCase() === claimStoreRecord.manager.toLowerCase()
      : false;
  const claimCode =
    claimRecord && claimStoreMeta ? buildClaimCode(claimStoreMeta, claimRecord.id) : null;
  const claimCustomer =
    claimRecord ? customerByAddress[claimRecord.user.toLowerCase()] : undefined;

  async function handleClaim(slug: string) {
    if (!account) {
      await connect();
      return;
    }

    if (!contractAddress) {
      setActionError(
        locale === "pt-BR"
          ? "Contrato não configurado nesta rede."
          : "Contract not configured on this network."
      );
      return;
    }

    if (isWrongChain) {
      setActionError(
        locale === "pt-BR"
          ? `Troque sua carteira para ${expectedChainLabel} antes de continuar.`
          : `Switch your wallet to ${expectedChainLabel} before continuing.`
      );
      return;
    }

    try {
      setActionError(null);
      setClaimingSlug(slug);
      const txHash = await claimRewardTx({
        contractAddress,
        storeId: encodeStoreId(slug),
        chainId: initialChainId
      });
      const receipt = await waitForTransaction(txHash, initialChainId);
      const nextClaimId = extractClaimIdFromReceipt(receipt);

      if (nextClaimId === null) {
        throw new Error(
          locale === "pt-BR"
            ? "Não foi possível encontrar o claim criado."
            : "Could not find the emitted claim id."
        );
      }

      router.push(`/app/claim/${nextClaimId}`);
    } catch (error) {
      setActionError(
        getUserFacingErrorMessage(
          error,
          locale === "pt-BR"
            ? "Não foi possível gerar o resgate."
            : "Could not create the reward claim."
        )
      );
    } finally {
      setClaimingSlug(null);
    }
  }

  function handlePurchaseQr(rawValue: string) {
    try {
      const url = new URL(rawValue);
      if (url.pathname.startsWith("/app/store/") || url.pathname.startsWith("/store/")) {
        setScannerError(null);
        router.push(`${url.pathname}${url.search}`);
        return true;
      }
    } catch {
      // Ignore malformed URLs and fall through to the friendly error.
    }

    setScannerError(
      locale === "pt-BR"
        ? "O QR lido não aponta para um pagamento válido."
        : "The scanned QR does not point to a valid payment."
    );
    return false;
  }

  async function handleConsume() {
    if (!claimId || !contractAddress) {
      setClaimLookupError(
        locale === "pt-BR"
          ? "Leia um QR ou informe um código antes de confirmar."
          : "Scan a QR or enter a code before confirming."
      );
      return;
    }

    if (!account) {
      await connect();
      return;
    }

    if (isWrongChain) {
      setClaimLookupError(
        locale === "pt-BR"
          ? `Troque sua carteira para ${expectedChainLabel} antes de continuar.`
          : `Switch your wallet to ${expectedChainLabel} before continuing.`
      );
      return;
    }

    if (selectedCustomer && claimRecord?.user.toLowerCase() !== selectedCustomer.toLowerCase()) {
      setClaimLookupError(
        locale === "pt-BR"
          ? "Este resgate pertence a outro cliente."
          : "This claim belongs to another customer."
      );
      return;
    }

    try {
      setClaimLookupError(null);
      setIsConsuming(true);
      const txHash = await consumeRewardTx({
        contractAddress,
        claimId,
        chainId: initialChainId
      });
      await waitForTransaction(txHash, initialChainId);

      router.push(
        `/success?mode=consume&tx=${txHash}&claim=${claimId}&store=${claimStoreMeta?.slug ?? ""}`
      );
    } catch (error) {
      setClaimLookupError(
        getUserFacingErrorMessage(
          error,
          locale === "pt-BR"
            ? "Não foi possível confirmar o resgate."
            : "Could not confirm the reward."
        )
      );
    } finally {
      setIsConsuming(false);
    }
  }

  async function submitProfile() {
    if (!profileName.trim()) {
      return;
    }

    try {
      setActionError(null);
      await saveProfile({
        name: profileName.trim(),
        avatarUrl: profileAvatarUrl.trim() || undefined
      });
      setProfileModalMode(null);
    } catch (error) {
      setActionError(
        getUserFacingErrorMessage(
          error,
          locale === "pt-BR"
            ? "Não foi possível salvar o perfil."
            : "Could not save the profile."
        )
      );
    }
  }

  const walletState = {
    account,
    chainId,
    expectedChainId,
    expectedChainLabel,
    contractAddress,
    hasProvider,
    isMiniPay,
    isConnecting,
    isDisconnectedByUser,
    isWrongChain,
    connect,
    switchToDefaultChain,
    refreshWalletState,
    disconnect
  };

  return (
    <AppChrome
      walletState={walletState}
      onProfileClick={() => setProfileModalMode("edit")}
    >
      <section className="space-y-8">
        {profileModalMode ? (
          <ProfileModal
            locale={locale}
            mode={profileModalMode}
            name={profileName}
            avatarUrl={profileAvatarUrl}
            error={profileError}
            isSaving={isSavingProfile}
            onNameChange={setProfileName}
            onAvatarChange={setProfileAvatarUrl}
            onClose={() => setProfileModalMode(null)}
            onSkip={() => {
              dismissProfilePrompt();
              setProfileModalMode(null);
            }}
            onSave={() => void submitProfile()}
          />
        ) : null}

        {(connectError || actionError) ? (
          <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {connectError || actionError}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-3xl">
              {locale === "pt-BR" ? "Seu dashboard" : "Your dashboard"}
            </h1>

            <button
              type="button"
              onClick={() =>
                replaceDashboardState({
                  scanner:
                    activeScanner === (role === "customer" ? "purchase" : "claim")
                      ? undefined
                      : role === "customer"
                        ? "purchase"
                      : "claim"
                })
              }
              className="flex flex-col items-center gap-2 text-[#241B3C]"
              aria-label={
                role === "customer"
                  ? locale === "pt-BR"
                    ? "Ler QR de pagamento"
                    : "Scan payment QR"
                  : locale === "pt-BR"
                    ? "Abrir validador de QR"
                    : "Open QR validator"
              }
              title={
                role === "customer"
                  ? locale === "pt-BR"
                    ? "Ler QR de pagamento"
                    : "Scan payment QR"
                  : locale === "pt-BR"
                    ? "Abrir validador de QR"
                    : "Open QR validator"
              }
            >
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_12px_32px_rgba(23,18,42,0.06)] ${
                  activeScanner === (role === "customer" ? "purchase" : "claim")
                    ? "border-transparent bg-[#17122A] text-white"
                    : "border-[#DED9F0] bg-white text-[#241B3C]"
                }`}
              >
                <QrActionIcon />
              </span>
              <span className="text-xs font-medium text-[#625B78]">
                {role === "customer"
                  ? locale === "pt-BR"
                    ? "Pagar agora"
                    : "Pay now"
                  : locale === "pt-BR"
                    ? "Validar QR"
                    : "Validate QR"}
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
            {managerMode ? (
              <div className="inline-flex rounded-full border border-[#E7E1F1] bg-white p-1">
                <TabToggle
                  active={role === "customer"}
                  label={locale === "pt-BR" ? "Cliente" : "Customer"}
                  onClick={() => replaceDashboardState({ role: "customer", tab: "loyalty" })}
                />
                <TabToggle
                  active={role === "merchant"}
                  label={locale === "pt-BR" ? "Loja" : "Merchant"}
                  onClick={() => replaceDashboardState({ role: "merchant", tab: "users" })}
                />
              </div>
            ) : null}

            {role === "merchant" && selectedManagedStore && managedStores.length > 1 ? (
              <HeadlessSelect
                value={selectedManagedStore.slug}
                onChange={setSelectedStoreSlug}
                align="right"
                options={managedStores.map((store) => ({
                  value: store.slug,
                  label: resolveText(store.name, locale),
                  description: `${resolveText(store.category, locale)} · ${resolveText(
                    store.city,
                    locale
                  )}`
                }))}
                triggerClassName="min-w-[16rem]"
              />
            ) : null}
            </div>
          </div>
        </div>

        {role === "customer" ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <KpiCard
                label={locale === "pt-BR" ? "Recompensas resgatadas" : "Rewards claimed"}
                value={customerClaims.length}
              />
              <KpiCard
                label={locale === "pt-BR" ? "Selos atuais" : "Current stamps"}
                value={totalCurrentStamps}
              />
            </div>

            {activeScanner === "purchase" ? (
              <QrScanner
                title={locale === "pt-BR" ? "Pagar agora" : "Pay now"}
                description={
                  locale === "pt-BR"
                    ? "Leia o QR da loja para abrir o item certo e continuar o pagamento."
                    : "Scan the store QR to open the right item and continue the payment."
                }
                notice={scannerError}
                onClose={() => replaceDashboardState({ scanner: undefined })}
                onDetected={handlePurchaseQr}
              />
            ) : null}

            <div className="flex flex-wrap gap-2">
              <DashboardTab
                active={activeTab === "loyalty"}
                label={locale === "pt-BR" ? "Fidelidade" : "Loyalty"}
                onClick={() => replaceDashboardState({ tab: "loyalty" })}
              />
              <DashboardTab
                active={activeTab === "rewards"}
                label={locale === "pt-BR" ? "Recompensas" : "Rewards"}
                onClick={() => replaceDashboardState({ tab: "rewards" })}
              />
              <DashboardTab
                active={activeTab === "stores"}
                label={locale === "pt-BR" ? "Lojas" : "Stores"}
                onClick={() => replaceDashboardState({ tab: "stores" })}
              />
            </div>

            {activeTab === "loyalty" ? (
              loyaltyStores.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {loyaltyStores.map((store) => {
                    const progress = progressBySlug[store.slug] ?? 0;

                    return (
                      <Card key={store.slug} className="overflow-hidden">
                        <div className={`h-24 bg-gradient-to-br ${store.accent}`} />
                        <CardContent className="space-y-5 pt-6">
                          <div className="flex items-start gap-4">
                            <StoreLogo
                              name={resolveText(store.name, locale)}
                              imageUrl={store.storeLogoUrl}
                              size="md"
                              className="-mt-12 border-white bg-white shadow-[0_14px_36px_rgba(23,18,42,0.1)]"
                            />
                            <div className="space-y-2 pt-1">
                              <p className="text-xl font-semibold tracking-[-0.03em] text-[#18122A]">
                                {resolveText(store.name, locale)}
                              </p>
                              <p className="text-sm text-[#625B78]">
                                {buildRewardCopy(store, locale)}
                              </p>
                            </div>
                          </div>
                          <ProgressMeter value={progress} total={store.loyalty.stampsRequired} />
                          <p className="text-sm text-[#625B78]">
                            {buildStampRuleCopy(store, locale)}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/app/store/${store.slug}`}>
                              <Button size="sm">{locale === "pt-BR" ? "Abrir loja" : "Open store"}</Button>
                            </Link>
                            {claimableBySlug[store.slug] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleClaim(store.slug)}
                                disabled={claimingSlug === store.slug}
                              >
                                {claimingSlug === store.slug
                                  ? locale === "pt-BR"
                                    ? "Resgatando..."
                                    : "Claiming..."
                                  : locale === "pt-BR"
                                    ? "Resgatar"
                                    : "Claim"}
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={locale === "pt-BR" ? "Nenhuma fidelidade ativa ainda." : "No active loyalty yet."}
                  description={
                    locale === "pt-BR"
                      ? "Assim que você pagar em uma loja, o progresso aparece aqui."
                      : "Once you pay at a store, your progress will show up here."
                  }
                />
              )
            ) : null}

            {activeTab === "rewards" ? (
              customerClaims.length > 0 ? (
                <div className="grid gap-4">
                  {customerClaims.map((claim) => {
                    const store = findStoreBySlug(stores, decodeStoreId(claim.storeId));
                    const claimCode = store ? buildClaimCode(store, claim.id) : null;

                    return (
                      <Card key={claim.id.toString()}>
                        <CardContent className="space-y-4 pt-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-[#18122A]">
                                {store ? resolveText(store.name, locale) : decodeStoreId(claim.storeId)}
                              </p>
                              <p className="text-sm text-[#625B78]">
                                {store ? buildRewardCopy(store, locale) : locale === "pt-BR" ? "Recompensa" : "Reward"}
                              </p>
                            </div>
                            <p className="text-sm text-[#625B78]">
                              {claim.consumed
                                ? locale === "pt-BR"
                                  ? "Consumida"
                                  : "Consumed"
                                : locale === "pt-BR"
                                  ? "Pendente"
                                  : "Pending"}
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <InfoLine
                              label={locale === "pt-BR" ? "Data" : "Date"}
                              value={formatDateLabel(claim.claimedAt, locale)}
                            />
                            <InfoLine
                              label={locale === "pt-BR" ? "Código" : "Code"}
                              value={claimCode ?? claim.id.toString()}
                              mono
                            />
                            <InfoLine
                              label={locale === "pt-BR" ? "Status" : "Status"}
                              value={
                                claim.consumed
                                  ? locale === "pt-BR"
                                    ? "Consumida"
                                    : "Consumed"
                                  : locale === "pt-BR"
                                    ? "Pendente"
                                    : "Pending"
                              }
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/app/claim/${claim.id.toString()}`}>
                              <Button size="sm">
                                {locale === "pt-BR" ? "Ver QR" : "View QR"}
                              </Button>
                            </Link>
                            {store ? (
                              <Link href={`/app/store/${store.slug}`}>
                                <Button size="sm" variant="outline">
                                  {locale === "pt-BR" ? "Abrir loja" : "Open store"}
                                </Button>
                              </Link>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={locale === "pt-BR" ? "Nenhuma recompensa resgatada." : "No rewards claimed yet."}
                  description={
                    locale === "pt-BR"
                      ? "Quando você gerar um claim, o histórico aparece aqui."
                      : "Once you generate a claim, it will appear here."
                  }
                />
              )
            ) : null}

            {activeTab === "stores" ? (
              <section className="space-y-5">
                <div className="max-w-md">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={locale === "pt-BR" ? "Buscar lojas" : "Search stores"}
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStores.map((store) => (
                    <Card key={store.slug} className="overflow-hidden">
                      <div className={`h-24 bg-gradient-to-br ${store.accent}`} />
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex items-start gap-4">
                          <StoreLogo
                            name={resolveText(store.name, locale)}
                            imageUrl={store.storeLogoUrl}
                            size="md"
                            className="-mt-12 border-white bg-white shadow-[0_14px_36px_rgba(23,18,42,0.1)]"
                          />
                          <div className="space-y-2 pt-1">
                            <p className="text-xl font-semibold tracking-[-0.03em] text-[#18122A]">
                              {resolveText(store.name, locale)}
                            </p>
                            <p className="text-sm text-[#625B78]">
                              {resolveText(store.category, locale)} · {resolveText(store.city, locale)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-7 text-[#625B78]">
                          {resolveText(store.summary, locale)}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/app/store/${store.slug}`}>
                            <Button size="sm">{locale === "pt-BR" ? "Comprar" : "Buy"}</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <KpiCard
                label={locale === "pt-BR" ? "Usuários ativos" : "Active users"}
                value={activeUserCount}
              />
              <KpiCard
                label={locale === "pt-BR" ? "Recompensas" : "Rewards"}
                value={merchantClaims.length}
              />
            </div>

            {managerMode ? (
              <div className="flex flex-wrap gap-2">
                <DashboardTab
                  active={activeTab === "users"}
                  label={locale === "pt-BR" ? "Usuários" : "Users"}
                  onClick={() => replaceDashboardState({ tab: "users" })}
                />
                <DashboardTab
                  active={activeTab === "rewards"}
                  label={locale === "pt-BR" ? "Recompensas" : "Rewards"}
                  onClick={() => replaceDashboardState({ tab: "rewards" })}
                />
              </div>
            ) : (
              <EmptyState
                title={locale === "pt-BR" ? "Conecte uma carteira de loja." : "Connect a store wallet."}
                description={
                  locale === "pt-BR"
                    ? "O modo de loja fica disponível quando a carteira conectada corresponde ao gerente configurado da loja."
                    : "Merchant mode becomes available when the connected wallet matches a configured store manager."
                }
              />
            )}

            {activeScanner === "claim" || claimParam ? (
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
                <div className="space-y-6">
                  {selectedCustomer ? (
                    <Card>
                      <CardContent className="space-y-2 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
                          {locale === "pt-BR" ? "Cliente selecionado" : "Selected customer"}
                        </p>
                        <div className="flex items-center gap-3">
                          <CustomerAvatar
                            name={
                              selectedCustomerSummary?.profile?.displayName ??
                              formatWalletLabel(selectedCustomer)
                            }
                            avatarUrl={selectedCustomerSummary?.profile?.avatarUrl}
                          />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-[#18122A]">
                              {selectedCustomerSummary?.profile?.displayName ??
                                formatWalletLabel(selectedCustomer)}
                            </p>
                            {selectedCustomerSummary?.profile ? (
                              <p className="text-sm text-[#625B78]">
                                {formatWalletLabel(selectedCustomer)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(null)}
                          >
                            {locale === "pt-BR" ? "Limpar seleção" : "Clear selection"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="grid gap-6 lg:grid-cols-2">
                <QrScanner
                  title={locale === "pt-BR" ? "Validar recompensa" : "Validate reward"}
                  description={
                    locale === "pt-BR"
                      ? "Leia o QR gerado pelo cliente para carregar o claim."
                      : "Scan the QR generated by the customer to load the claim."
                  }
                  notice={claimScannerNotice}
                  onClose={() => {
                    setClaimScannerNotice(null);
                    replaceDashboardState({ scanner: undefined });
                  }}
                  onDetected={async (value) => {
                    setClaimInputValue(value);
                    return lookupClaim(value, { source: "scanner" });
                  }}
                />

                    <Card>
                      <CardHeader>
                        <CardTitle>{locale === "pt-BR" ? "Validar manualmente" : "Manual validation"}</CardTitle>
                        <CardDescription>
                          {locale === "pt-BR"
                            ? "Cole um link, um código ou apenas o claimId."
                            : "Paste a link, a short code, or just the claim id."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          value={claimInputValue}
                          onChange={(event) => setClaimInputValue(event.target.value)}
                          placeholder={
                            locale === "pt-BR"
                              ? "Ex.: CHOI-0001 ou claim 1"
                              : "Ex.: CHOI-0001 or claim 1"
                          }
                        />
                        <Button onClick={() => void lookupClaim(claimInputValue, { source: "manual" })}>
                          {locale === "pt-BR" ? "Validar resgate" : "Check claim"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{locale === "pt-BR" ? "Detalhes do resgate" : "Claim details"}</CardTitle>
                    <CardDescription>
                      {locale === "pt-BR"
                        ? "Confira loja, cliente e status antes de confirmar."
                        : "Review the store, customer, and status before confirming."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {claimRecord && claimStoreMeta && claimStoreRecord ? (
                      <>
                        <div className="space-y-2 border-t border-[#EEE8F5] pt-4">
                          <p className="text-sm font-semibold text-[#18122A]">
                            {resolveText(claimStoreMeta.name, locale)}
                          </p>
                          <p className="text-sm text-[#625B78]">
                            {buildRewardCopy(claimStoreMeta, locale)}
                          </p>
                          {claimCode ? (
                            <p className="font-mono text-sm text-[#18122A]">{claimCode}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2 border-t border-[#EEE8F5] pt-4 text-sm text-[#625B78]">
                          <p>
                            {locale === "pt-BR" ? "Cliente" : "Customer"}:{" "}
                            <span className="text-[#18122A]">
                              {claimCustomer?.profile?.displayName ??
                                formatWalletLabel(claimRecord.user)}
                            </span>
                          </p>
                          {claimCustomer?.profile ? (
                            <p>
                              {locale === "pt-BR" ? "Carteira" : "Wallet"}:{" "}
                              <span className="text-[#18122A]">
                                {formatWalletLabel(claimRecord.user)}
                              </span>
                            </p>
                          ) : null}
                          <p>
                            {locale === "pt-BR" ? "Status" : "Status"}:{" "}
                            <span className="text-[#18122A]">
                              {claimRecord.consumed
                                ? locale === "pt-BR"
                                  ? "Consumido"
                                  : "Consumed"
                                : locale === "pt-BR"
                                  ? "Pendente"
                                  : "Pending"}
                            </span>
                          </p>
                          <p>
                            {locale === "pt-BR" ? "Carteira da loja" : "Store wallet"}:{" "}
                            <span className="text-[#18122A]">
                              {formatWalletLabel(claimStoreRecord.manager)}
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[#625B78]">
                        {locale === "pt-BR"
                          ? "Nenhum resgate carregado ainda."
                          : "No claim loaded yet."}
                      </p>
                    )}

                    {claimLookupError ? (
                      <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
                        {claimLookupError}
                      </p>
                    ) : null}

                    <Button
                      onClick={() => void handleConsume()}
                      disabled={!claimRecord || claimRecord.consumed || !isAuthorizedManager || isConsuming}
                    >
                      {isConsuming
                        ? locale === "pt-BR"
                          ? "Confirmando..."
                          : "Confirming..."
                        : locale === "pt-BR"
                          ? "Confirmar resgate"
                          : "Confirm reward"}
                    </Button>
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {managerMode && activeTab === "users" ? (
              filteredCustomers.length > 0 ? (
                <div className="grid gap-4">
                  <div className="max-w-md">
                    <Input
                      value={customerQuery}
                      onChange={(event) => setCustomerQuery(event.target.value)}
                      placeholder={
                        locale === "pt-BR" ? "Buscar por endereço" : "Search by address"
                      }
                    />
                  </div>
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.address}>
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <CustomerAvatar
                              name={
                                customer.profile?.displayName ??
                                formatWalletLabel(customer.address)
                              }
                              avatarUrl={customer.profile?.avatarUrl}
                            />
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-[#18122A]">
                                {customer.profile?.displayName ??
                                  formatWalletLabel(customer.address)}
                              </p>
                              <p className="text-sm text-[#625B78]">
                                {customer.profile
                                  ? formatWalletLabel(customer.address)
                                  : customer.canClaim
                                    ? locale === "pt-BR"
                                      ? "Pronto para resgatar"
                                      : "Ready to claim"
                                    : locale === "pt-BR"
                                      ? "Acumulando selos"
                                      : "Collecting stamps"}
                              </p>
                              {customer.profile ? (
                                <p className="text-sm text-[#625B78]">
                                  {customer.canClaim
                                    ? locale === "pt-BR"
                                      ? "Pronto para resgatar"
                                      : "Ready to claim"
                                    : locale === "pt-BR"
                                      ? "Acumulando selos"
                                      : "Collecting stamps"}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer.address);
                              replaceDashboardState({ scanner: "claim", claim: undefined });
                            }}
                          >
                            {locale === "pt-BR" ? "Ler QR da recompensa" : "Read reward QR"}
                          </Button>
                        </div>
                        <ProgressMeter value={customer.stamps} total={customer.stampsRequired} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isLoadingMerchantData ? (
                <EmptyState
                  title={locale === "pt-BR" ? "Carregando usuários..." : "Loading users..."}
                  description=""
                />
              ) : (
                <EmptyState
                  title={locale === "pt-BR" ? "Nenhum usuário encontrado." : "No users found."}
                  description={
                    locale === "pt-BR"
                      ? "Assim que a loja registrar compras, os clientes aparecem aqui."
                      : "Once the store records purchases, customers will show up here."
                  }
                />
              )
            ) : null}

            {managerMode && activeTab === "rewards" ? (
              merchantClaims.length > 0 ? (
                <div className="grid gap-4">
                  {merchantClaims.map((claim) => {
                    const store = findStoreBySlug(stores, decodeStoreId(claim.storeId));
                    const rewardCode = store ? buildClaimCode(store, claim.id) : claim.id.toString();
                    const claimCustomerSummary = customerByAddress[claim.user.toLowerCase()];

                    return (
                      <Card key={claim.id.toString()}>
                        <CardContent className="space-y-4 pt-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <CustomerAvatar
                                name={
                                  claimCustomerSummary?.profile?.displayName ??
                                  formatWalletLabel(claim.user)
                                }
                                avatarUrl={claimCustomerSummary?.profile?.avatarUrl}
                              />
                              <div className="space-y-2">
                                <p className="text-lg font-semibold text-[#18122A]">
                                  {claimCustomerSummary?.profile?.displayName ??
                                    formatWalletLabel(claim.user)}
                                </p>
                                <p className="text-sm text-[#625B78]">
                                  {claimCustomerSummary?.profile
                                    ? formatWalletLabel(claim.user)
                                    : formatDateLabel(claim.claimedAt, locale)}
                                </p>
                                {claimCustomerSummary?.profile ? (
                                  <p className="text-sm text-[#625B78]">
                                    {formatDateLabel(claim.claimedAt, locale)}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <p className="text-sm text-[#625B78]">
                              {claim.consumed
                                ? locale === "pt-BR"
                                  ? "Consumido"
                                  : "Consumed"
                                : locale === "pt-BR"
                                  ? "Pendente"
                                  : "Pending"}
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <InfoLine
                              label={locale === "pt-BR" ? "Código" : "Code"}
                              value={rewardCode}
                              mono
                            />
                            <InfoLine
                              label={locale === "pt-BR" ? "Recompensa" : "Reward"}
                              value={
                                store
                                  ? buildRewardCopy(store, locale)
                                  : locale === "pt-BR"
                                    ? "Recompensa"
                                    : "Reward"
                              }
                            />
                            <InfoLine
                              label={locale === "pt-BR" ? "Status" : "Status"}
                              value={
                                claim.consumed
                                  ? locale === "pt-BR"
                                    ? "Consumido"
                                    : "Consumed"
                                  : locale === "pt-BR"
                                    ? "Pendente"
                                    : "Pending"
                              }
                            />
                          </div>
                          {!claim.consumed ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCustomer(claim.user);
                                setClaimInputValue(claim.id.toString());
                                replaceDashboardState({
                                  scanner: "claim",
                                  claim: claim.id.toString()
                                });
                              }}
                            >
                              {locale === "pt-BR" ? "Validar" : "Validate"}
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={locale === "pt-BR" ? "Nenhuma recompensa gerada." : "No rewards created yet."}
                  description={
                    locale === "pt-BR"
                      ? "Os claims emitidos para esta loja aparecem aqui."
                      : "Claims created for this store will appear here."
                  }
                />
              )
            ) : null}
          </>
        )}
      </section>
    </AppChrome>
  );
}

function isTabAllowedForRole(tab: string, role: DashboardRole) {
  if (role === "customer") {
    return tab === "loyalty" || tab === "rewards" || tab === "stores";
  }

  return tab === "users" || tab === "rewards";
}

function DashboardTab({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-[#17122A] text-white"
          : "border border-[#E7E1F1] bg-white text-[#625B78]"
      }`}
    >
      {label}
    </button>
  );
}

function TabToggle({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active ? "bg-[#17122A] text-white" : "text-[#625B78]"
      }`}
    >
      {label}
    </button>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
          {label}
        </p>
        <p className="text-4xl font-semibold tracking-[-0.04em] text-[#18122A]">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <p className="text-lg font-semibold text-[#18122A]">{title}</p>
        {description ? <p className="text-sm leading-7 text-[#625B78]">{description}</p> : null}
      </CardContent>
    </Card>
  );
}

function InfoLine({
  label,
  value,
  mono
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-t border-[#EEE8F5] pt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
        {label}
      </p>
      <p className={`mt-2 text-sm text-[#18122A] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function ProfileModal({
  locale,
  mode,
  name,
  avatarUrl,
  error,
  isSaving,
  onNameChange,
  onAvatarChange,
  onClose,
  onSkip,
  onSave
}: {
  locale: "pt-BR" | "en";
  mode: ProfileModalMode;
  name: string;
  avatarUrl: string;
  error: string | null;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
  onClose: () => void;
  onSkip: () => void;
  onSave: () => void;
}) {
  const isSetup = mode === "setup";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#17122A]/22 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[32px] border border-[#ECEAF4] bg-white p-6 shadow-[0_28px_90px_rgba(23,18,42,0.16)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#18122A]">
            {locale === "pt-BR" ? "Seu perfil no noodl3" : "Your noodl3 profile"}
          </h2>
          <p className="text-sm leading-7 text-[#625B78]">
            {locale === "pt-BR"
              ? "Adicione um nome e, se quiser, uma foto. Você pode pular isso por agora."
              : "Add a display name and, if you want, a photo. You can skip this for now."}
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <Input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={locale === "pt-BR" ? "Seu nome" : "Your name"}
          />
          <Input
            value={avatarUrl}
            onChange={(event) => onAvatarChange(event.target.value)}
            placeholder={
              locale === "pt-BR"
                ? "Link da foto (opcional)"
              : "Profile image URL (optional)"
            }
          />
          {error ? (
            <p className="rounded-[20px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 pt-6">
          <Button onClick={onSave} disabled={!name.trim() || isSaving}>
            {isSaving
              ? locale === "pt-BR"
                ? "Salvando..."
                : "Saving..."
              : locale === "pt-BR"
                ? "Salvar"
                : "Save"}
          </Button>
          {isSetup ? (
            <Button variant="outline" onClick={onSkip} disabled={isSaving}>
              {locale === "pt-BR" ? "Pular por agora" : "Skip for now"}
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              {locale === "pt-BR" ? "Fechar" : "Close"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerAvatar({
  name,
  avatarUrl
}: {
  name: string;
  avatarUrl?: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  if (avatarUrl && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-11 w-11 rounded-full border border-[#ECEAF4] object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ECEAF4] bg-[#F5F3FA] text-sm font-semibold text-[#17122A]">
      {getInitials(name)}
    </span>
  );
}

function QrActionIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h2" />
      <path d="M18 14h2v2" />
      <path d="M14 18h2v2h-2z" />
      <path d="M18 18h2v2h-2z" />
    </svg>
  );
}
