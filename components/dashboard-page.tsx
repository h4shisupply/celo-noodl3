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
  MerchantCatalogPanel,
  MerchantOnchainPanel
} from "./merchant-settings-panels";
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
  normalizeClaimInputValue,
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
import { interpolate, type Dictionary } from "../lib/i18n";
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
  fetchContractOwner,
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
  stores: initialStores,
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
  const { locale, dictionary } = useLocale();
  const [stores, setStores] = useState(initialStores);
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
  const [contractOwner, setContractOwner] = useState<Hex | null>(null);
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

  useEffect(() => {
    setStores(initialStores);
  }, [initialStores]);

  useEffect(() => {
    async function loadContractOwner() {
      if (!contractAddress) {
        setContractOwner(null);
        return;
      }

      setContractOwner(await fetchContractOwner(initialChainId, contractAddress));
    }

    void loadContractOwner();
  }, [contractAddress, initialChainId]);

  const isContractOwner =
    account && contractOwner
      ? account.toLowerCase() === contractOwner.toLowerCase()
      : false;
  const managedStores = useMemo(() => {
    if (isContractOwner) {
      return stores;
    }

    if (!account) return [];

    return stores.filter(
      (candidate) =>
        candidate.onchain?.manager &&
        candidate.onchain.manager.toLowerCase() === account.toLowerCase()
    );
  }, [account, isContractOwner, stores]);

  const merchantMode = managedStores.length > 0;
  const role: DashboardRole = merchantMode ? "merchant" : explicitRole ?? "customer";
  const activeTab =
    explicitTab && isTabAllowedForRole(explicitTab, role)
      ? explicitTab
      : role === "merchant"
        ? "users"
        : "loyalty";
  const activeScanner = explicitScanner;

  const selectedManagedStore = useMemo(() => {
    if (!merchantMode) return null;

    return (
      managedStores.find((candidate) => candidate.slug === selectedStoreSlug) ??
      managedStores[0] ??
      null
    );
  }, [managedStores, merchantMode, selectedStoreSlug]);

  useEffect(() => {
    if (!merchantMode) {
      setSelectedStoreSlug("");
      return;
    }

    setSelectedStoreSlug((current) =>
      managedStores.some((candidate) => candidate.slug === current)
        ? current
        : managedStores[0]?.slug ?? ""
    );
  }, [managedStores, merchantMode]);

  useEffect(() => {
    if (!merchantMode) {
      return;
    }

    const needsRewrite =
      explicitRole !== "merchant" ||
      (explicitTab !== null && explicitTab !== undefined && !isTabAllowedForRole(explicitTab, "merchant")) ||
      explicitScanner === "purchase";

    if (!needsRewrite) {
      return;
    }

    router.replace(
      buildDashboardUrl({
        role: "merchant",
        tab: activeTab,
        scanner:
          explicitScanner === "claim" || explicitScanner === "claim-code"
            ? explicitScanner
            : undefined,
        claim: claimParam
      })
    );
  }, [activeTab, claimParam, explicitRole, explicitScanner, explicitTab, merchantMode, router]);

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
      if (merchantMode || !account || !contractAddress || isWrongChain) {
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
  }, [account, contractAddress, initialChainId, isWrongChain, merchantMode, stores]);

  useEffect(() => {
    async function loadMerchantData() {
      if (!selectedManagedStore || !contractAddress || !merchantMode || isWrongChain) {
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
  }, [contractAddress, initialChainId, isWrongChain, merchantMode, selectedManagedStore]);

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
        role: merchantMode
          ? "merchant"
          : "role" in nextState
            ? normalizeDashboardRole(nextState.role)
            : explicitRole,
        tab:
          "tab" in nextState
            ? normalizeDashboardTab(nextState.tab)
            : explicitTab,
        scanner:
          merchantMode
            ? "scanner" in nextState
              ? normalizeDashboardScanner(nextState.scanner) === "claim" ||
                normalizeDashboardScanner(nextState.scanner) === "claim-code"
                ? normalizeDashboardScanner(nextState.scanner)
                : undefined
              : explicitScanner === "claim" || explicitScanner === "claim-code"
                ? explicitScanner
                : undefined
            : "scanner" in nextState
            ? normalizeDashboardScanner(nextState.scanner)
            : explicitScanner,
        claim: "claim" in nextState ? nextState.claim || undefined : claimParam
      });

      router.replace(href);
    },
    [claimParam, explicitRole, explicitScanner, explicitTab, merchantMode, router]
  );

  useEffect(() => {
    if (
      !merchantMode ||
      (explicitScanner !== "claim" && explicitScanner !== "claim-code") ||
      !claimParam
    ) {
      return;
    }

    router.replace(
      buildDashboardUrl({
        role: "merchant",
        claim: claimParam
      })
    );
  }, [claimParam, explicitScanner, merchantMode, router]);

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
        return showLookupError(dictionary.messages.invalidClaimId);
      }

      if (!contractAddress) {
        return showLookupError(dictionary.messages.contractUnavailable);
      }

      if (account && isWrongChain) {
        return showLookupError(
          interpolate(dictionary.messages.switchToNetworkBeforeContinue, {
            network: expectedChainLabel
          })
        );
      }

      setClaimLookupError(null);
      setClaimScannerNotice(null);
      setClaimId(parsed);

      const nextClaimRecord = await fetchClaim(parsed, initialChainId, contractAddress);
      if (!nextClaimRecord) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(dictionary.messages.claimNotFound);
      }

      const nextStoreRecord = await fetchStore(nextClaimRecord.storeId, initialChainId, contractAddress);
      if (!nextStoreRecord) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(dictionary.messages.storeNotFound);
      }

      if (selectedManagedStore) {
        const selectedStoreId = encodeStoreId(selectedManagedStore.slug).toLowerCase();
        if (nextClaimRecord.storeId.toLowerCase() !== selectedStoreId) {
          setClaimRecord(null);
          setClaimStoreRecord(null);
          return showLookupError(dictionary.messages.claimWrongStore);
        }
      }

      if (
        selectedCustomer &&
        nextClaimRecord.user.toLowerCase() !== selectedCustomer.toLowerCase()
      ) {
        setClaimRecord(null);
        setClaimStoreRecord(null);
        return showLookupError(dictionary.messages.claimWrongCustomer);
      }

      setClaimRecord(nextClaimRecord);
      setClaimStoreRecord(nextStoreRecord);

      if (nextClaimRecord.consumed) {
        setClaimLookupError(dictionary.messages.claimAlreadyUsed);
      }

      return true;
    },
    [account, contractAddress, dictionary, expectedChainLabel, initialChainId, isWrongChain, selectedCustomer, selectedManagedStore]
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
  const isRewardVerifierScannerOpen =
    merchantMode && activeScanner === "claim" && !claimParam;
  const isRewardVerifierCodeOpen =
    merchantMode && activeScanner === "claim-code" && !claimParam;
  const isFocusedRewardVerifier = merchantMode && Boolean(claimParam);
  const isFocusedRewardFlow = isFocusedRewardVerifier || isRewardVerifierCodeOpen;
  const isRewardVerifierOpen =
    isRewardVerifierScannerOpen || isRewardVerifierCodeOpen || isFocusedRewardVerifier;

  async function handleClaim(slug: string) {
    if (!account) {
      await connect();
      return;
    }

    if (!contractAddress) {
      setActionError(dictionary.common.contractMissing);
      return;
    }

    if (isWrongChain) {
      setActionError(
        interpolate(dictionary.messages.switchToNetworkBeforeContinue, {
          network: expectedChainLabel
        })
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
        throw new Error(dictionary.messages.claimCreatedMissing);
      }

      router.push(`/app/claim/${nextClaimId}`);
    } catch (error) {
      setActionError(
        getUserFacingErrorMessage(
          error,
          dictionary.messages.claimFailed
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

    setScannerError(dictionary.messages.qrMismatch);
    return false;
  }

  async function handleConsume() {
    if (!claimId || !contractAddress) {
      setClaimLookupError(dictionary.messages.claimLookupFirst);
      return;
    }

    if (!account) {
      await connect();
      return;
    }

    if (isWrongChain) {
      setClaimLookupError(
        interpolate(dictionary.messages.switchToNetworkBeforeContinue, {
          network: expectedChainLabel
        })
      );
      return;
    }

    if (selectedCustomer && claimRecord?.user.toLowerCase() !== selectedCustomer.toLowerCase()) {
      setClaimLookupError(dictionary.messages.claimWrongCustomer);
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
          dictionary.messages.consumeFailed
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
          dictionary.messages.profileSaveFailed
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
  const claimDetailsCard = (
    <Card className={isFocusedRewardVerifier ? "mx-auto w-full max-w-xl" : undefined}>
      <CardHeader>
        <CardTitle>{dictionary.verifier.detailsTitle}</CardTitle>
        <CardDescription>{dictionary.verifier.detailsDescription}</CardDescription>
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
                {dictionary.common.customer}:{" "}
                <span className="text-[#18122A]">
                  {claimCustomer?.profile?.displayName ?? formatWalletLabel(claimRecord.user)}
                </span>
              </p>
              {claimCustomer?.profile ? (
                <p>
                  {dictionary.verifier.customerWalletLabel}:{" "}
                  <span className="text-[#18122A]">
                    {formatWalletLabel(claimRecord.user)}
                  </span>
                </p>
              ) : null}
              <p>
                {dictionary.common.status}:{" "}
                <span className="text-[#18122A]">
                  {claimRecord.consumed
                    ? dictionary.common.consumed
                    : dictionary.common.pending}
                </span>
              </p>
              <p>
                {dictionary.verifier.storeWalletLabel}:{" "}
                <span className="text-[#18122A]">
                  {formatWalletLabel(claimStoreRecord.manager)}
                </span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-[#625B78]">
            {dictionary.verifier.detailsLoading}
          </p>
        )}

        {claimLookupError ? (
          <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {claimLookupError}
          </p>
        ) : null}

        <Button
          className={isFocusedRewardVerifier ? "w-full" : undefined}
          onClick={() => void handleConsume()}
          disabled={!claimRecord || claimRecord.consumed || !isAuthorizedManager || isConsuming}
        >
          {isConsuming
            ? `${dictionary.actions.consumeReward}...`
            : dictionary.actions.consumeReward}
        </Button>
      </CardContent>
    </Card>
  );
  const manualClaimValidationCard = (
    <Card className={isRewardVerifierCodeOpen ? "mx-auto w-full max-w-xl" : undefined}>
      <CardHeader>
        <CardTitle>{dictionary.verifier.manualCardTitle}</CardTitle>
        <CardDescription>{dictionary.verifier.manualCardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={claimInputValue}
          onChange={(event) =>
            setClaimInputValue(normalizeClaimInputValue(event.target.value))
          }
          placeholder={dictionary.verifier.manualShortPlaceholder}
        />
        <Button
          className={isRewardVerifierCodeOpen ? "w-full" : undefined}
          onClick={async () => {
            const parsedClaimId = parseClaimInput(claimInputValue);
            const loaded = await lookupClaim(claimInputValue, { source: "manual" });

            if (loaded && parsedClaimId !== null) {
              replaceDashboardState({
                scanner: undefined,
                claim: parsedClaimId.toString()
              });
            }
          }}
        >
          {dictionary.actions.checkClaim}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <AppChrome
      walletState={walletState}
      onProfileClick={() => setProfileModalMode("edit")}
    >
      <section className="space-y-8">
        {profileModalMode ? (
          <ProfileModal
            dictionary={dictionary}
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

        {!isFocusedRewardFlow ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-3xl">
                {dictionary.dashboard.shellTitle}
              </h1>

              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    replaceDashboardState({
                      scanner:
                        activeScanner === (role === "customer" ? "purchase" : "claim")
                          ? undefined
                          : role === "customer"
                            ? "purchase"
                            : "claim",
                      claim: undefined
                    })
                  }
                  className="flex flex-col items-center gap-2 text-[#241B3C]"
                  aria-label={
                    role === "customer"
                      ? dictionary.dashboard.paymentScannerAria
                      : dictionary.dashboard.verifierScannerAria
                  }
                  title={
                    role === "customer"
                      ? dictionary.dashboard.paymentScannerAria
                      : dictionary.dashboard.verifierScannerAria
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
                      ? dictionary.dashboard.paymentScannerLabel
                      : dictionary.dashboard.verifierScannerLabel}
                  </span>
                </button>

                {role === "merchant" ? (
                  <button
                    type="button"
                    onClick={() =>
                      replaceDashboardState({
                        scanner: activeScanner === "claim-code" ? undefined : "claim-code",
                        claim: undefined
                      })
                    }
                    className="flex flex-col items-center gap-2 text-[#241B3C]"
                    aria-label={dictionary.dashboard.codeValidatorAria}
                    title={dictionary.dashboard.codeValidatorAria}
                  >
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_12px_32px_rgba(23,18,42,0.06)] ${
                        activeScanner === "claim-code"
                          ? "border-transparent bg-[#17122A] text-white"
                          : "border-[#DED9F0] bg-white text-[#241B3C]"
                      }`}
                    >
                      <CodeActionIcon />
                    </span>
                    <span className="text-xs font-medium text-[#625B78]">
                      {dictionary.dashboard.codeValidatorLabel}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
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
        ) : null}

        {role === "customer" ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <KpiCard
                label={dictionary.dashboard.kpis.rewardsClaimed}
                value={customerClaims.length}
              />
              <KpiCard
                label={dictionary.dashboard.kpis.currentStamps}
                value={totalCurrentStamps}
              />
            </div>

            {activeScanner === "purchase" ? (
              <QrScanner
                title={dictionary.dashboard.payNowTitle}
                description={dictionary.dashboard.scanDescription}
                notice={scannerError}
                onClose={() => replaceDashboardState({ scanner: undefined })}
                onDetected={handlePurchaseQr}
              />
            ) : null}

            <div className="flex flex-wrap gap-2">
              <DashboardTab
                active={activeTab === "loyalty"}
                label={dictionary.dashboard.tabs.loyalty}
                onClick={() => replaceDashboardState({ tab: "loyalty" })}
              />
              <DashboardTab
                active={activeTab === "rewards"}
                label={dictionary.dashboard.tabs.rewards}
                onClick={() => replaceDashboardState({ tab: "rewards" })}
              />
              <DashboardTab
                active={activeTab === "stores"}
                label={dictionary.dashboard.tabs.stores}
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
                              <Button size="sm">{dictionary.rewards.goToStore}</Button>
                            </Link>
                            {claimableBySlug[store.slug] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleClaim(store.slug)}
                                disabled={claimingSlug === store.slug}
                              >
                                {claimingSlug === store.slug
                                  ? `${dictionary.actions.claimNow}...`
                                  : dictionary.actions.claimNow}
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
                  title={dictionary.dashboard.loyaltyEmptyTitle}
                  description={dictionary.dashboard.loyaltyEmptyDescription}
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
                                {store ? buildRewardCopy(store, locale) : dictionary.common.reward}
                              </p>
                            </div>
                            <p className="text-sm text-[#625B78]">
                              {claim.consumed
                                ? dictionary.common.used
                                : dictionary.common.pending}
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <InfoLine
                              label={dictionary.common.date}
                              value={formatDateLabel(claim.claimedAt, locale)}
                            />
                            <InfoLine
                              label={dictionary.common.code}
                              value={claimCode ?? claim.id.toString()}
                              mono
                            />
                            <InfoLine
                              label={dictionary.common.status}
                              value={
                                claim.consumed
                                  ? dictionary.common.used
                                  : dictionary.common.pending
                              }
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/app/claim/${claim.id.toString()}`}>
                              <Button size="sm">{dictionary.actions.viewQr}</Button>
                            </Link>
                            {store ? (
                              <Link href={`/app/store/${store.slug}`}>
                                <Button size="sm" variant="outline">
                                  {dictionary.rewards.goToStore}
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
                  title={dictionary.dashboard.rewardsEmptyTitle}
                  description={dictionary.dashboard.rewardsEmptyDescription}
                />
              )
            ) : null}

            {activeTab === "stores" ? (
              <section className="space-y-5">
                <div className="max-w-md">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={dictionary.dashboard.storesSearchPlaceholder}
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
                            <Button size="sm">{dictionary.actions.buy}</Button>
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
            {!isFocusedRewardFlow ? (
              <>
            <div className="grid gap-5 md:grid-cols-2">
              <KpiCard
                label={dictionary.dashboard.kpis.activeUsers}
                value={activeUserCount}
              />
              <KpiCard
                label={dictionary.dashboard.kpis.rewards}
                value={merchantClaims.length}
              />
            </div>

            {merchantMode ? (
              <div className="flex flex-wrap gap-2">
                <DashboardTab
                  active={activeTab === "users"}
                  label={dictionary.dashboard.tabs.users}
                  onClick={() => replaceDashboardState({ tab: "users" })}
                />
                <DashboardTab
                  active={activeTab === "rewards"}
                  label={dictionary.dashboard.tabs.rewards}
                  onClick={() => replaceDashboardState({ tab: "rewards" })}
                />
                <DashboardTab
                  active={activeTab === "catalog"}
                  label={dictionary.dashboard.tabs.catalog}
                  onClick={() => replaceDashboardState({ tab: "catalog" })}
                />
                <DashboardTab
                  active={activeTab === "onchain"}
                  label={dictionary.dashboard.tabs.onchain}
                  onClick={() => replaceDashboardState({ tab: "onchain" })}
                />
              </div>
            ) : (
              <EmptyState
                title={dictionary.dashboard.noStoreWalletTitle}
                description={dictionary.dashboard.noStoreWalletDescription}
              />
            )}
              </>
            ) : null}

            {isRewardVerifierOpen ? (
              isFocusedRewardVerifier ? (
                <section className="flex min-h-[calc(100dvh-12rem)] items-start justify-center pt-2">
                  {claimDetailsCard}
                </section>
              ) : isRewardVerifierCodeOpen ? (
                <section className="flex min-h-[calc(100dvh-12rem)] items-start justify-center pt-2">
                  {manualClaimValidationCard}
                </section>
              ) : (
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
                <div className="space-y-6">
                  {selectedCustomer ? (
                    <Card>
                      <CardContent className="space-y-2 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
                          {dictionary.verifier.selectedCustomerLabel}
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
                            {dictionary.actions.clearSelection}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="grid gap-6 lg:grid-cols-2">
                    {isRewardVerifierScannerOpen ? (
                      <QrScanner
                        title={dictionary.verifier.scannerFocusedTitle}
                        description={dictionary.verifier.scannerFocusedDescription}
                        notice={claimScannerNotice}
                        processingLabel={dictionary.verifier.detailsLoading}
                        closeOnDetected={false}
                        onClose={() => {
                          setClaimScannerNotice(null);
                          replaceDashboardState({ scanner: undefined });
                        }}
                        onDetected={async (value) => {
                          const parsedClaimId = parseClaimInput(value);
                          setClaimInputValue(value);
                          const loaded = await lookupClaim(value, { source: "scanner" });

                          if (loaded && parsedClaimId !== null) {
                            setClaimScannerNotice(null);
                            replaceDashboardState({
                              scanner: undefined,
                              claim: parsedClaimId.toString()
                            });
                          }

                          return loaded;
                        }}
                      />
                    ) : null}

                    {manualClaimValidationCard}
                  </div>
                </div>

                {claimDetailsCard}
              </section>
              )
            ) : null}

            {merchantMode && !isRewardVerifierOpen && activeTab === "users" ? (
              filteredCustomers.length > 0 ? (
                <div className="grid gap-4">
                  <div className="max-w-md">
                    <Input
                      value={customerQuery}
                      onChange={(event) => setCustomerQuery(event.target.value)}
                      placeholder={dictionary.verifier.customerSearchPlaceholder}
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
                                    ? dictionary.verifier.readyLabel
                                    : dictionary.verifier.collectingLabel}
                              </p>
                              {customer.profile ? (
                                <p className="text-sm text-[#625B78]">
                                  {customer.canClaim
                                    ? dictionary.verifier.readyLabel
                                    : dictionary.verifier.collectingLabel}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <ProgressMeter value={customer.stamps} total={customer.stampsRequired} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isLoadingMerchantData ? (
                <EmptyState
                  title={dictionary.verifier.customersLoadingTitle}
                  description=""
                />
              ) : (
                <EmptyState
                  title={dictionary.verifier.customersEmptyTitle}
                  description={dictionary.verifier.customersEmpty}
                />
              )
            ) : null}

            {merchantMode && !isRewardVerifierOpen && activeTab === "rewards" ? (
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
                                ? dictionary.common.consumed
                                : dictionary.common.pending}
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <InfoLine
                              label={dictionary.common.code}
                              value={rewardCode}
                              mono
                            />
                            <InfoLine
                              label={dictionary.common.reward}
                              value={
                                store
                                  ? buildRewardCopy(store, locale)
                                  : dictionary.common.reward
                              }
                            />
                            <InfoLine
                              label={dictionary.common.status}
                              value={
                                claim.consumed
                                  ? dictionary.common.consumed
                                  : dictionary.common.pending
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
                              {dictionary.actions.validate}
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={dictionary.verifier.merchantRewardsEmptyTitle}
                  description={dictionary.verifier.merchantRewardsEmptyDescription}
                />
              )
            ) : null}

            {merchantMode && !isRewardVerifierOpen && activeTab === "catalog" && selectedManagedStore ? (
              <MerchantCatalogPanel
                selectedStore={selectedManagedStore}
                initialChainId={initialChainId}
                onStoresUpdated={setStores}
              />
            ) : null}

            {merchantMode && !isRewardVerifierOpen && activeTab === "onchain" && selectedManagedStore ? (
              <MerchantOnchainPanel
                selectedStore={selectedManagedStore}
                initialChainId={initialChainId}
                contractAddress={contractAddress}
                isContractOwner={isContractOwner}
                onStoresUpdated={setStores}
              />
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

  return tab === "users" || tab === "rewards" || tab === "catalog" || tab === "onchain";
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
  dictionary,
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
  dictionary: Dictionary;
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
            {dictionary.profile.title}
          </h2>
          <p className="text-sm leading-7 text-[#625B78]">
            {dictionary.profile.description}
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <Input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={dictionary.profile.namePlaceholder}
          />
          <Input
            value={avatarUrl}
            onChange={(event) => onAvatarChange(event.target.value)}
            placeholder={dictionary.profile.avatarPlaceholder}
          />
          {error ? (
            <p className="rounded-[20px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 pt-6">
          <Button onClick={onSave} disabled={!name.trim() || isSaving}>
            {isSaving ? dictionary.common.saving : dictionary.actions.save}
          </Button>
          {isSetup ? (
            <Button variant="outline" onClick={onSkip} disabled={isSaving}>
              {dictionary.actions.skipForNow}
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              {dictionary.common.close}
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

function CodeActionIcon() {
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
      <path d="M9 7 4 12l5 5" />
      <path d="M15 7l5 5-5 5" />
      <path d="M13 5 11 19" />
    </svg>
  );
}
