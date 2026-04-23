"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, getAddress, parseUnits, type Hex } from "viem";
import {
  buildMerchantPatchMessage,
  type MerchantCatalogMenuPatchItem,
  type MerchantCatalogPatchPayload,
  type MerchantOwnerMirrorPatchPayload
} from "../lib/merchant-catalog";
import {
  fetchStore,
  fetchStoreAcceptedTokens
} from "../lib/contract";
import { getUserFacingErrorMessage } from "../lib/error-message";
import { encodeStoreId } from "../lib/store-id";
import {
  canonicalizeStablecoinValueInput,
  normalizeStablecoinValueInput,
  sanitizeStablecoinDecimalString
} from "../lib/stablecoin-value";
import {
  configureStoreAcceptedTokensTx,
  configureStoreTx,
  signWalletMessage,
  waitForTransaction
} from "../lib/wallet";
import {
  getSupportedTokens,
  type SupportedToken
} from "../lib/tokens";
import { useAutoDismissMessage } from "../lib/use-auto-dismiss-message";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HeadlessSelect } from "./ui/headless-select";
import { Input } from "./ui/input";
import type { LocalizedText, StoreCatalogEntry } from "../lib/catalog";

type LocalizedFieldKey = "pt-BR" | "en";
type EditableMenuDraft = MerchantCatalogMenuPatchItem & {
  isExisting: boolean;
  draftKey: string;
};

type OnchainFormState = {
  manager: string;
  payout: string;
  token: string;
  acceptedTokens: string[];
  minimumPurchase: string;
  stampsPerPurchase: string;
  stampsRequired: string;
  rewardType: StoreCatalogEntry["loyalty"]["rewardType"];
  rewardValue: string;
  active: boolean;
};

function buildDraftKey() {
  return `draft:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
}

function emptyLocalizedText(): LocalizedText {
  return {
    "pt-BR": "",
    en: ""
  };
}

function cloneLocalizedText(value: LocalizedText): LocalizedText {
  return {
    "pt-BR": value["pt-BR"],
    en: value.en
  };
}

function cloneMenuDraft(item: StoreCatalogEntry["menu"][number]): EditableMenuDraft {
  return {
    id: item.id,
    name: cloneLocalizedText(item.name),
    description: cloneLocalizedText(item.description),
    price: canonicalizeStablecoinValueInput(item.price),
    badge: item.badge ? cloneLocalizedText(item.badge) : null,
    archived: Boolean(item.archived),
    isExisting: true,
    draftKey: `existing:${item.id}`
  };
}

function buildDraftMenuId(index: number) {
  return `item-${index + 1}`;
}

function buildCatalogDraftState(store: StoreCatalogEntry) {
  return {
    storeDraft: {
      name: cloneLocalizedText(store.name),
      storeLogoUrl: store.storeLogoUrl || "",
      category: cloneLocalizedText(store.category),
      city: cloneLocalizedText(store.city),
      accent: store.accent,
      summary: cloneLocalizedText(store.summary)
    },
    menuDraft: store.menu.map(cloneMenuDraft)
  };
}

function serializeCatalogDraft(params: {
  storeSlug: string;
  storeDraft: {
    name: LocalizedText;
    storeLogoUrl: string;
    category: LocalizedText;
    city: LocalizedText;
    accent: string;
    summary: LocalizedText;
  };
  menuDraft: EditableMenuDraft[];
}) {
  return JSON.stringify({
    storeSlug: params.storeSlug,
    store: {
      name: params.storeDraft.name,
      storeLogoUrl: params.storeDraft.storeLogoUrl.trim(),
      category: params.storeDraft.category,
      city: params.storeDraft.city,
      accent: params.storeDraft.accent.trim(),
      summary: params.storeDraft.summary
    },
    menu: params.menuDraft.map(({ isExisting: _isExisting, draftKey: _draftKey, ...item }) => ({
      ...item,
      price: item.price.trim(),
      badge:
        item.badge?.["pt-BR"]?.trim() || item.badge?.en?.trim() ? item.badge : null
    }))
  });
}

function buildOnchainFormState(
  store: StoreCatalogEntry,
  supportedTokens: SupportedToken[],
  onchainStore?: Awaited<ReturnType<typeof fetchStore>> | null,
  acceptedTokens?: Hex[]
): OnchainFormState {
  return {
    manager: onchainStore?.manager || store.onchain?.manager || "",
    payout: onchainStore?.payout || store.onchain?.payout || "",
    token: onchainStore?.token || store.onchain?.token || supportedTokens[0]?.address || "",
    acceptedTokens:
      (acceptedTokens?.length
        ? acceptedTokens
        : store.onchain?.acceptedTokens || []
      ).map((address) => address.toLowerCase()),
    minimumPurchase: canonicalizeStablecoinValueInput(
      onchainStore
        ? formatUnits(onchainStore.minPurchaseAmount, 18)
        : store.loyalty.minimumPurchase
    ),
    stampsPerPurchase: String(
      onchainStore?.stampsPerPurchase ?? store.loyalty.stampsPerPurchase
    ),
    stampsRequired: String(
      onchainStore?.stampsRequired ?? store.loyalty.stampsRequired
    ),
    rewardType: onchainStore?.rewardType ?? store.loyalty.rewardType,
    rewardValue: canonicalizeStablecoinValueInput(
      onchainStore ? formatUnits(onchainStore.rewardValue, 18) : store.loyalty.rewardValue
    ),
    active: onchainStore?.active ?? true
  };
}

function serializeOnchainForm(form: OnchainFormState) {
  return JSON.stringify({
    ...form,
    manager: form.manager.trim(),
    payout: form.payout.trim(),
    token: form.token.trim(),
    minimumPurchase: form.minimumPurchase.trim(),
    stampsPerPurchase: form.stampsPerPurchase.trim(),
    stampsRequired: form.stampsRequired.trim(),
    rewardValue: form.rewardValue.trim()
  });
}

async function saveMerchantPatch<T extends MerchantCatalogPatchPayload | MerchantOwnerMirrorPatchPayload>(
  payload: T,
  chainId: number
) {
  const message = buildMerchantPatchMessage(payload);
  const { account, signature } = await signWalletMessage({
    message,
    chainId
  });
  const response = await fetch("/api/merchant/catalog", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...payload,
      signer: account,
      message,
      signature
    })
  });
  const data = (await response.json()) as {
    error?: string;
    stores?: StoreCatalogEntry[];
    deployment?: {
      id?: string | null;
      url?: string | null;
    };
  };

  if (!response.ok || !data.stores) {
    throw new Error(data.error || "Could not save the merchant settings.");
  }

  return {
    stores: data.stores,
    deployment: data.deployment
  };
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
      {children}
    </label>
  );
}

function SuccessToast({
  message
}: {
  message: string;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-[26px] border border-[#CDEFD8] bg-white px-5 py-4 shadow-[0_24px_80px_rgba(23,18,42,0.14)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F8EC] text-[#2D7A46]">
          ✓
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#1B1630]">Saved</p>
          <p className="text-sm leading-6 text-[#5E6173]">{message}</p>
        </div>
      </div>
    </div>
  );
}

function StatusChoice({
  active,
  title,
  description,
  onClick,
  disabled
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-[26px] border px-5 py-4 text-left transition ${
        active
          ? "border-[#17122A] bg-[#17122A] text-white shadow-[0_18px_40px_rgba(23,18,42,0.18)]"
          : "border-[#E7E1F1] bg-white text-[#241B3C]"
      } ${disabled ? "cursor-default opacity-70" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-3 w-3 rounded-full ${
            active ? "bg-[#8EF0AE]" : "bg-[#D0CADD]"
          }`}
        />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-white/74" : "text-[#7A748E]"}`}>
        {description}
      </p>
    </button>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function StablecoinValueField({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Input
        value={value}
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]{0,6}"
        onChange={(event) => onChange(normalizeStablecoinValueInput(event.target.value))}
        onBlur={() => {
          const canonicalValue = canonicalizeStablecoinValueInput(value);
          if (canonicalValue !== value) {
            onChange(canonicalValue);
          }
        }}
        disabled={disabled}
      />
    </div>
  );
}

function LocalizedFields({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value: LocalizedText;
  onChange: (locale: LocalizedFieldKey, nextValue: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <FieldLabel>{label}</FieldLabel>
      <SectionGrid>
        <Input
          value={value["pt-BR"]}
          onChange={(event) => onChange("pt-BR", event.target.value)}
          placeholder="pt-BR"
          disabled={disabled}
        />
        <Input
          value={value.en}
          onChange={(event) => onChange("en", event.target.value)}
          placeholder="en"
          disabled={disabled}
        />
      </SectionGrid>
    </div>
  );
}

export function MerchantCatalogPanel({
  selectedStore,
  initialChainId,
  onStoresUpdated
}: {
  selectedStore: StoreCatalogEntry;
  initialChainId: number;
  onStoresUpdated: (stores: StoreCatalogEntry[]) => void;
}) {
  const { locale } = useLocale();
  const initialDraftState = useMemo(
    () => buildCatalogDraftState(selectedStore),
    [selectedStore]
  );
  const [storeDraft, setStoreDraft] = useState(initialDraftState.storeDraft);
  const [menuDraft, setMenuDraft] = useState<EditableMenuDraft[]>(initialDraftState.menuDraft);
  const [baselineSnapshot, setBaselineSnapshot] = useState(() =>
    serializeCatalogDraft({
      storeSlug: selectedStore.slug,
      storeDraft: initialDraftState.storeDraft,
      menuDraft: initialDraftState.menuDraft
    })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previousStoreSlugRef = useRef(selectedStore.slug);
  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  useAutoDismissMessage(status, clearStatus, 3500);

  useEffect(() => {
    const storeChanged = previousStoreSlugRef.current !== selectedStore.slug;
    previousStoreSlugRef.current = selectedStore.slug;
    const nextDraftState = initialDraftState;
    setStoreDraft(nextDraftState.storeDraft);
    setMenuDraft(nextDraftState.menuDraft);
    setBaselineSnapshot(
      serializeCatalogDraft({
        storeSlug: selectedStore.slug,
        storeDraft: nextDraftState.storeDraft,
        menuDraft: nextDraftState.menuDraft
      })
    );
    if (storeChanged) {
      setStatus(null);
    }
    setError(null);
  }, [initialDraftState, selectedStore.slug]);

  const currentSnapshot = useMemo(
    () =>
      serializeCatalogDraft({
        storeSlug: selectedStore.slug,
        storeDraft,
        menuDraft
      }),
    [menuDraft, selectedStore.slug, storeDraft]
  );
  const isDirty = currentSnapshot !== baselineSnapshot;

  function updateStoreLocalizedField(
    field: "name" | "category" | "city" | "summary",
    localeKey: LocalizedFieldKey,
    value: string
  ) {
    setStoreDraft((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [localeKey]: value
      }
    }));
  }

  function updateMenuItem(
    draftKey: string,
    updater: (current: EditableMenuDraft) => EditableMenuDraft
  ) {
    setMenuDraft((current) =>
      current.map((item) => (item.draftKey === draftKey ? updater(item) : item))
    );
  }

  async function handleSaveCatalog() {
    try {
      setIsSaving(true);
      setStatus(null);
      setError(null);

      const payload: MerchantCatalogPatchPayload = {
        kind: "catalog",
        storeSlug: selectedStore.slug,
        submittedAt: new Date().toISOString(),
        store: {
          name: storeDraft.name,
          storeLogoUrl: storeDraft.storeLogoUrl || undefined,
          category: storeDraft.category,
          city: storeDraft.city,
          accent: storeDraft.accent,
          summary: storeDraft.summary
        },
        menu: menuDraft.map(({ isExisting: _isExisting, ...item }) => ({
          ...item,
          badge:
            item.badge?.["pt-BR"]?.trim() || item.badge?.en?.trim() ? item.badge : null
        }))
      };
      const data = await saveMerchantPatch(payload, initialChainId);
      onStoresUpdated(data.stores);
      const nextSelectedStore =
        data.stores.find((store) => store.slug === selectedStore.slug) ?? selectedStore;
      const nextDraftState = buildCatalogDraftState(nextSelectedStore);
      const nextSnapshot = serializeCatalogDraft({
        storeSlug: nextSelectedStore.slug,
        storeDraft: nextDraftState.storeDraft,
        menuDraft: nextDraftState.menuDraft
      });
      setStoreDraft(nextDraftState.storeDraft);
      setMenuDraft(nextDraftState.menuDraft);
      setBaselineSnapshot(nextSnapshot);
      setStatus(
        data.deployment?.url
          ? locale === "pt-BR"
            ? "Catálogo salvo e novo deploy enviado ao Vercel."
            : "Catalog saved and a fresh Vercel deploy was started."
          : locale === "pt-BR"
            ? "Catálogo salvo."
            : "Catalog saved."
      );
    } catch (nextError) {
      setError(
        getUserFacingErrorMessage(
          nextError,
          locale === "pt-BR"
            ? "Não foi possível salvar o catálogo."
            : "Could not save the catalog."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === "pt-BR" ? "Dados da loja" : "Store details"}
          </CardTitle>
          <CardDescription>
            {locale === "pt-BR"
              ? "Edite os campos que vêm do catálogo publicado no Vercel."
              : "Edit the fields that come from the catalog published on Vercel."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LocalizedFields
            label={locale === "pt-BR" ? "Nome da loja" : "Store name"}
            value={storeDraft.name}
            onChange={(localeKey, value) => updateStoreLocalizedField("name", localeKey, value)}
          />
          <LocalizedFields
            label={locale === "pt-BR" ? "Categoria" : "Category"}
            value={storeDraft.category}
            onChange={(localeKey, value) =>
              updateStoreLocalizedField("category", localeKey, value)
            }
          />
          <LocalizedFields
            label={locale === "pt-BR" ? "Cidade" : "City"}
            value={storeDraft.city}
            onChange={(localeKey, value) => updateStoreLocalizedField("city", localeKey, value)}
          />
          <LocalizedFields
            label={locale === "pt-BR" ? "Resumo" : "Summary"}
            value={storeDraft.summary}
            onChange={(localeKey, value) =>
              updateStoreLocalizedField("summary", localeKey, value)
            }
          />
          <SectionGrid>
            <TextField
              label={locale === "pt-BR" ? "Logo URL" : "Logo URL"}
              value={storeDraft.storeLogoUrl}
              onChange={(value) => setStoreDraft((current) => ({ ...current, storeLogoUrl: value }))}
              placeholder="https://..."
            />
            <TextField
              label={locale === "pt-BR" ? "Accent gradient" : "Accent gradient"}
              value={storeDraft.accent}
              onChange={(value) => setStoreDraft((current) => ({ ...current, accent: value }))}
            />
          </SectionGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "pt-BR" ? "Itens do menu" : "Menu items"}</CardTitle>
          <CardDescription>
            {locale === "pt-BR"
              ? "Itens existentes mantêm o mesmo id. Para remover do app, marque como arquivado."
              : "Existing items keep the same id. Archive an item to remove it from the live menu."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {menuDraft.map((item) => (
            <div
              key={item.draftKey}
              className="rounded-[28px] border border-[#ECEAF4] bg-[#FBFAFD] p-5"
            >
              <div className="grid gap-5">
                <SectionGrid>
                  <TextField
                    label="ID"
                    value={item.id}
                    onChange={(value) =>
                      updateMenuItem(item.draftKey, (current) => ({ ...current, id: value }))
                    }
                    disabled={item.isExisting}
                  />
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-3 text-sm text-[#625B78]">
                      <input
                        type="checkbox"
                        checked={Boolean(item.archived)}
                        onChange={(event) =>
                          updateMenuItem(item.draftKey, (current) => ({
                            ...current,
                            archived: event.target.checked
                          }))
                        }
                      />
                      {locale === "pt-BR" ? "Arquivado" : "Archived"}
                    </label>
                  </div>
                </SectionGrid>
                <LocalizedFields
                  label={locale === "pt-BR" ? "Nome" : "Name"}
                  value={item.name}
                  onChange={(localeKey, value) =>
                    updateMenuItem(item.draftKey, (current) => ({
                      ...current,
                      name: {
                        ...current.name,
                        [localeKey]: value
                      }
                    }))
                  }
                />
                <LocalizedFields
                  label={locale === "pt-BR" ? "Descrição" : "Description"}
                  value={item.description}
                  onChange={(localeKey, value) =>
                    updateMenuItem(item.draftKey, (current) => ({
                      ...current,
                      description: {
                        ...current.description,
                        [localeKey]: value
                      }
                    }))
                  }
                />
                <LocalizedFields
                  label={locale === "pt-BR" ? "Badge" : "Badge"}
                  value={item.badge || emptyLocalizedText()}
                  onChange={(localeKey, value) =>
                    updateMenuItem(item.draftKey, (current) => ({
                      ...current,
                      badge: {
                        ...(current.badge || emptyLocalizedText()),
                        [localeKey]: value
                      }
                    }))
                  }
                />
                <StablecoinValueField
                  label={locale === "pt-BR" ? "Preço" : "Price"}
                  value={item.price}
                  onChange={(value) =>
                    updateMenuItem(item.draftKey, (current) => ({ ...current, price: value }))
                  }
                />
                {!item.isExisting ? (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMenuDraft((current) =>
                          current.filter((candidate) => candidate.draftKey !== item.draftKey)
                        )
                      }
                    >
                      {locale === "pt-BR" ? "Remover novo item" : "Remove new item"}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                    setMenuDraft((current) => [
                      ...current,
                      {
                        id: buildDraftMenuId(current.length),
                        name: emptyLocalizedText(),
                        description: emptyLocalizedText(),
                        price: "0.01",
                        badge: emptyLocalizedText(),
                        archived: false,
                        isExisting: false,
                        draftKey: buildDraftKey()
                      }
                    ])
                  }
            >
              {locale === "pt-BR" ? "Adicionar item" : "Add item"}
            </Button>
            <Button onClick={() => void handleSaveCatalog()} disabled={isSaving || !isDirty}>
              {isSaving
                ? locale === "pt-BR"
                  ? "Salvando..."
                  : "Saving..."
                : locale === "pt-BR"
                  ? "Salvar catálogo"
                  : "Save catalog"}
            </Button>
          </div>

          {error ? (
            <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
      {status ? <SuccessToast message={status} /> : null}
    </div>
  );
}

export function MerchantOnchainPanel({
  selectedStore,
  initialChainId,
  contractAddress,
  isContractOwner,
  onStoresUpdated
}: {
  selectedStore: StoreCatalogEntry;
  initialChainId: number;
  contractAddress: Hex | null;
  isContractOwner: boolean;
  onStoresUpdated: (stores: StoreCatalogEntry[]) => void;
}) {
  const { locale } = useLocale();
  const supportedTokens = useMemo(
    () => getSupportedTokens(initialChainId),
    [initialChainId]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState<OnchainFormState>(() =>
    buildOnchainFormState(selectedStore, supportedTokens)
  );
  const [baselineSnapshot, setBaselineSnapshot] = useState(() =>
    serializeOnchainForm(buildOnchainFormState(selectedStore, supportedTokens))
  );
  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);
  const previousStoreSlugRef = useRef(selectedStore.slug);

  useAutoDismissMessage(status, clearStatus, 3500);

  useEffect(() => {
    const storeChanged = previousStoreSlugRef.current !== selectedStore.slug;
    previousStoreSlugRef.current = selectedStore.slug;

    async function loadOnchainValues() {
      if (!contractAddress) {
        const nextForm = buildOnchainFormState(selectedStore, supportedTokens);
        setForm(nextForm);
        setBaselineSnapshot(serializeOnchainForm(nextForm));
        if (storeChanged) {
          setStatus(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      if (storeChanged) {
        setStatus(null);
      }

      try {
        const storeId = encodeStoreId(selectedStore.slug);
        const [onchainStore, acceptedTokens] = await Promise.all([
          fetchStore(storeId, initialChainId, contractAddress),
          fetchStoreAcceptedTokens(storeId, initialChainId, contractAddress)
        ]);

        const nextForm = buildOnchainFormState(
          selectedStore,
          supportedTokens,
          onchainStore,
          acceptedTokens
        );
        setForm(nextForm);
        setBaselineSnapshot(serializeOnchainForm(nextForm));
      } catch (nextError) {
        setError(
          getUserFacingErrorMessage(
            nextError,
            locale === "pt-BR"
              ? "Não foi possível carregar a configuração onchain."
              : "Could not load the onchain settings."
          )
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOnchainValues();
  }, [contractAddress, initialChainId, locale, selectedStore, supportedTokens]);

  const isDirty = useMemo(
    () => serializeOnchainForm(form) !== baselineSnapshot,
    [baselineSnapshot, form]
  );

  async function handleSaveOnchain() {
    if (!contractAddress) {
      setError(
        locale === "pt-BR"
          ? "Contrato indisponível nesta rede."
          : "Contract unavailable on this network."
      );
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setStatus(null);

      const normalizedAcceptedTokens = form.acceptedTokens.map(
        (address) => getAddress(address) as Hex
      );
      const selectedTokenDefs = normalizedAcceptedTokens.map((address) => {
        const token = supportedTokens.find(
          (candidate) => candidate.address.toLowerCase() === address.toLowerCase()
        );

        if (!token) {
          throw new Error(`Unsupported token selected: ${address}`);
        }

        return token;
      });

      const storeId = encodeStoreId(selectedStore.slug);
      const minimumPurchase = sanitizeStablecoinDecimalString(
        form.minimumPurchase,
        "Minimum purchase"
      );
      const rewardValue = sanitizeStablecoinDecimalString(form.rewardValue, "Reward value");
      const configureHash = await configureStoreTx({
        contractAddress,
        storeId,
        payout: getAddress(form.payout) as Hex,
        manager: getAddress(form.manager) as Hex,
        token: getAddress(form.token) as Hex,
        minPurchaseAmount: parseUnits(minimumPurchase, 18),
        stampsPerPurchase: Number(form.stampsPerPurchase),
        stampsRequired: Number(form.stampsRequired),
        rewardType: form.rewardType === "free_item" ? 1 : 0,
        rewardValue: parseUnits(rewardValue, 18),
        active: form.active,
        chainId: initialChainId
      });
      await waitForTransaction(configureHash, initialChainId);

      const acceptedTokensHash = await configureStoreAcceptedTokensTx({
        contractAddress,
        storeId,
        tokens: selectedTokenDefs.map((token) => token.address),
        decimals: selectedTokenDefs.map((token) => token.decimals),
        chainId: initialChainId
      });
      await waitForTransaction(acceptedTokensHash, initialChainId);

      const payload: MerchantOwnerMirrorPatchPayload = {
        kind: "owner-mirror",
        storeSlug: selectedStore.slug,
        submittedAt: new Date().toISOString(),
        loyalty: {
          stampsPerPurchase: Number(form.stampsPerPurchase),
          stampsRequired: Number(form.stampsRequired),
          rewardType: form.rewardType,
          rewardValue,
          minimumPurchase
        },
        onchain: {
          manager: getAddress(form.manager) as Hex,
          payout: getAddress(form.payout) as Hex,
          token: getAddress(form.token) as Hex,
          acceptedTokens: selectedTokenDefs.map((token) => token.address),
          active: form.active
        }
      };

      const data = await saveMerchantPatch(payload, initialChainId);
      onStoresUpdated(data.stores);
      const nextForm = {
        ...form,
        acceptedTokens: [...form.acceptedTokens]
      };
      setBaselineSnapshot(serializeOnchainForm(nextForm));
      setStatus(
        locale === "pt-BR"
          ? "Configuração onchain atualizada e espelhada no catálogo."
          : "Onchain settings updated and mirrored into the catalog."
      );
    } catch (nextError) {
      setError(
        getUserFacingErrorMessage(
          nextError,
          locale === "pt-BR"
            ? "Não foi possível salvar a configuração onchain."
            : "Could not save the onchain settings."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale === "pt-BR" ? "Configuração onchain" : "Onchain settings"}</CardTitle>
        <CardDescription>
          {isContractOwner
            ? locale === "pt-BR"
              ? "Você está usando a carteira owner do contrato e pode reconfigurar esta loja."
              : "You are connected with the contract owner wallet and can reconfigure this store."
            : locale === "pt-BR"
              ? "Apenas a carteira owner do contrato pode salvar estas mudanças."
              : "Only the contract owner wallet can save changes here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SectionGrid>
          <TextField
            label={locale === "pt-BR" ? "Manager" : "Manager"}
            value={form.manager}
            onChange={(value) => setForm((current) => ({ ...current, manager: value }))}
            disabled={!isContractOwner}
          />
          <TextField
            label={locale === "pt-BR" ? "Payout" : "Payout"}
            value={form.payout}
            onChange={(value) => setForm((current) => ({ ...current, payout: value }))}
            disabled={!isContractOwner}
          />
        </SectionGrid>

        <HeadlessSelect
          label={locale === "pt-BR" ? "Token principal" : "Primary token"}
          value={form.token}
          onChange={(value) => setForm((current) => ({ ...current, token: value }))}
          disabled={!isContractOwner}
          options={supportedTokens.map((token) => ({
            value: token.address,
            label: token.symbol,
            description: token.name
          }))}
        />

        <div className="space-y-2">
          <FieldLabel>{locale === "pt-BR" ? "Tokens aceitos" : "Accepted tokens"}</FieldLabel>
          <div className="grid gap-3 md:grid-cols-3">
            {supportedTokens.map((token) => {
              const active = form.acceptedTokens.includes(token.address.toLowerCase());

              return (
                <button
                  key={token.address}
                  type="button"
                  disabled={!isContractOwner}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      acceptedTokens: active
                        ? current.acceptedTokens.filter(
                            (address) => address !== token.address.toLowerCase()
                          )
                        : [...current.acceptedTokens, token.address.toLowerCase()]
                    }))
                  }
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    active
                      ? "border-[#17122A] bg-[#17122A] text-white"
                      : "border-[#E7E1F1] bg-white text-[#241B3C]"
                  } ${!isContractOwner ? "cursor-default opacity-70" : ""}`}
                >
                  <p className="text-sm font-semibold">{token.symbol}</p>
                  <p className={`mt-1 text-xs ${active ? "text-white/72" : "text-[#7A748E]"}`}>
                    {token.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <SectionGrid>
          <StablecoinValueField
            label={locale === "pt-BR" ? "Compra mínima" : "Minimum purchase"}
            value={form.minimumPurchase}
            onChange={(value) => setForm((current) => ({ ...current, minimumPurchase: value }))}
            disabled={!isContractOwner}
          />
          <StablecoinValueField
            label={locale === "pt-BR" ? "Valor da recompensa" : "Reward value"}
            value={form.rewardValue}
            onChange={(value) => setForm((current) => ({ ...current, rewardValue: value }))}
            disabled={!isContractOwner}
          />
        </SectionGrid>

        <SectionGrid>
          <TextField
            label={locale === "pt-BR" ? "Selos por compra" : "Stamps per purchase"}
            value={form.stampsPerPurchase}
            onChange={(value) => setForm((current) => ({ ...current, stampsPerPurchase: value }))}
            disabled={!isContractOwner}
          />
          <TextField
            label={locale === "pt-BR" ? "Selos para resgatar" : "Stamps required"}
            value={form.stampsRequired}
            onChange={(value) => setForm((current) => ({ ...current, stampsRequired: value }))}
            disabled={!isContractOwner}
          />
        </SectionGrid>

        <SectionGrid>
          <HeadlessSelect
            label={locale === "pt-BR" ? "Tipo de recompensa" : "Reward type"}
            value={form.rewardType}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                rewardType: value as "fixed_amount" | "free_item"
              }))
            }
            disabled={!isContractOwner}
            options={[
              {
                value: "fixed_amount",
                label: locale === "pt-BR" ? "Valor fixo" : "Fixed amount"
              },
              {
                value: "free_item",
                label: locale === "pt-BR" ? "Item grátis" : "Free item"
              }
            ]}
          />
          <div className="space-y-2">
            <FieldLabel>{locale === "pt-BR" ? "Status da loja" : "Store status"}</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusChoice
                active={form.active}
                title={locale === "pt-BR" ? "Ativa" : "Active"}
                description={
                  locale === "pt-BR"
                    ? "Aceita compras e emite progresso normalmente."
                    : "Accepts purchases and records loyalty as usual."
                }
                onClick={() => setForm((current) => ({ ...current, active: true }))}
                disabled={!isContractOwner}
              />
              <StatusChoice
                active={!form.active}
                title={locale === "pt-BR" ? "Inativa" : "Inactive"}
                description={
                  locale === "pt-BR"
                    ? "Bloqueia novas compras até reativar a loja."
                    : "Blocks new purchases until the store is reactivated."
                }
                onClick={() => setForm((current) => ({ ...current, active: false }))}
                disabled={!isContractOwner}
              />
            </div>
          </div>
        </SectionGrid>

        {isLoading ? <p className="text-sm text-[#625B78]">Loading...</p> : null}
        {error ? (
          <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {error}
          </p>
        ) : null}

        {isContractOwner ? (
          <Button onClick={() => void handleSaveOnchain()} disabled={isSaving || !isDirty}>
            {isSaving
              ? locale === "pt-BR"
                ? "Salvando..."
                : "Saving..."
              : locale === "pt-BR"
                ? "Salvar onchain"
                : "Save onchain"}
          </Button>
        ) : null}
      </CardContent>
      {status ? <SuccessToast message={status} /> : null}
    </Card>
  );
}
