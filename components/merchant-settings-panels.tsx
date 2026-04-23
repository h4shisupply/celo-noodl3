"use client";

import { useEffect, useMemo, useState } from "react";
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
  configureStoreAcceptedTokensTx,
  configureStoreTx,
  signWalletMessage,
  waitForTransaction
} from "../lib/wallet";
import {
  getSupportedTokens,
  type SupportedToken
} from "../lib/tokens";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HeadlessSelect } from "./ui/headless-select";
import { Input } from "./ui/input";
import type { LocalizedText, StoreCatalogEntry } from "../lib/catalog";

type LocalizedFieldKey = "pt-BR" | "en";
type EditableMenuDraft = MerchantCatalogMenuPatchItem & {
  isExisting: boolean;
};

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
    price: item.price,
    badge: item.badge ? cloneLocalizedText(item.badge) : null,
    archived: Boolean(item.archived),
    isExisting: true
  };
}

function buildDraftMenuId(index: number) {
  return `item-${index + 1}`;
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
  const [storeDraft, setStoreDraft] = useState({
    name: cloneLocalizedText(selectedStore.name),
    storeLogoUrl: selectedStore.storeLogoUrl || "",
    category: cloneLocalizedText(selectedStore.category),
    city: cloneLocalizedText(selectedStore.city),
    accent: selectedStore.accent,
    summary: cloneLocalizedText(selectedStore.summary)
  });
  const [menuDraft, setMenuDraft] = useState<EditableMenuDraft[]>(
    selectedStore.menu.map(cloneMenuDraft)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStoreDraft({
      name: cloneLocalizedText(selectedStore.name),
      storeLogoUrl: selectedStore.storeLogoUrl || "",
      category: cloneLocalizedText(selectedStore.category),
      city: cloneLocalizedText(selectedStore.city),
      accent: selectedStore.accent,
      summary: cloneLocalizedText(selectedStore.summary)
    });
    setMenuDraft(selectedStore.menu.map(cloneMenuDraft));
    setStatus(null);
    setError(null);
  }, [selectedStore]);

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
    itemId: string,
    updater: (current: EditableMenuDraft) => EditableMenuDraft
  ) {
    setMenuDraft((current) =>
      current.map((item) => (item.id === itemId ? updater(item) : item))
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
          {menuDraft.map((item, index) => (
            <div key={item.id} className="rounded-[28px] border border-[#ECEAF4] bg-[#FBFAFD] p-5">
              <div className="grid gap-5">
                <SectionGrid>
                  <TextField
                    label="ID"
                    value={item.id}
                    onChange={(value) =>
                      updateMenuItem(item.id, (current) => ({ ...current, id: value }))
                    }
                    disabled={item.isExisting}
                  />
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-3 text-sm text-[#625B78]">
                      <input
                        type="checkbox"
                        checked={Boolean(item.archived)}
                        onChange={(event) =>
                          updateMenuItem(item.id, (current) => ({
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
                    updateMenuItem(item.id, (current) => ({
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
                    updateMenuItem(item.id, (current) => ({
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
                    updateMenuItem(item.id, (current) => ({
                      ...current,
                      badge: {
                        ...(current.badge || emptyLocalizedText()),
                        [localeKey]: value
                      }
                    }))
                  }
                />
                <TextField
                  label={locale === "pt-BR" ? "Preço" : "Price"}
                  value={item.price}
                  onChange={(value) =>
                    updateMenuItem(item.id, (current) => ({ ...current, price: value }))
                  }
                />
                {!item.isExisting ? (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMenuDraft((current) => current.filter((candidate) => candidate.id !== item.id))
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
                    isExisting: false
                  }
                ])
              }
            >
              {locale === "pt-BR" ? "Adicionar item" : "Add item"}
            </Button>
            <Button onClick={() => void handleSaveCatalog()} disabled={isSaving}>
              {isSaving
                ? locale === "pt-BR"
                  ? "Salvando..."
                  : "Saving..."
                : locale === "pt-BR"
                  ? "Salvar catálogo"
                  : "Save catalog"}
            </Button>
          </div>

          {status ? <p className="text-sm text-[#2D7A46]">{status}</p> : null}
          {error ? (
            <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
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
  const [form, setForm] = useState<{
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
  }>({
    manager: selectedStore.onchain?.manager || "",
    payout: selectedStore.onchain?.payout || "",
    token: selectedStore.onchain?.token || supportedTokens[0]?.address || "",
    acceptedTokens:
      selectedStore.onchain?.acceptedTokens?.map((address) => address.toLowerCase()) || [],
    minimumPurchase: selectedStore.loyalty.minimumPurchase,
    stampsPerPurchase: String(selectedStore.loyalty.stampsPerPurchase),
    stampsRequired: String(selectedStore.loyalty.stampsRequired),
    rewardType: selectedStore.loyalty.rewardType,
    rewardValue: selectedStore.loyalty.rewardValue,
    active: true
  });

  useEffect(() => {
    async function loadOnchainValues() {
      if (!contractAddress) {
        setForm({
          manager: selectedStore.onchain?.manager || "",
          payout: selectedStore.onchain?.payout || "",
          token: selectedStore.onchain?.token || supportedTokens[0]?.address || "",
          acceptedTokens:
            selectedStore.onchain?.acceptedTokens?.map((address) => address.toLowerCase()) || [],
          minimumPurchase: selectedStore.loyalty.minimumPurchase,
          stampsPerPurchase: String(selectedStore.loyalty.stampsPerPurchase),
          stampsRequired: String(selectedStore.loyalty.stampsRequired),
          rewardType: selectedStore.loyalty.rewardType,
          rewardValue: selectedStore.loyalty.rewardValue,
          active: true
        });
        return;
      }

      setIsLoading(true);
      setError(null);
      setStatus(null);

      try {
        const storeId = encodeStoreId(selectedStore.slug);
        const [onchainStore, acceptedTokens] = await Promise.all([
          fetchStore(storeId, initialChainId, contractAddress),
          fetchStoreAcceptedTokens(storeId, initialChainId, contractAddress)
        ]);

        setForm({
          manager: onchainStore?.manager || selectedStore.onchain?.manager || "",
          payout: onchainStore?.payout || selectedStore.onchain?.payout || "",
          token:
            onchainStore?.token ||
            selectedStore.onchain?.token ||
            supportedTokens[0]?.address ||
            "",
          acceptedTokens:
            (acceptedTokens.length > 0
              ? acceptedTokens
              : selectedStore.onchain?.acceptedTokens || []
            ).map((address) => address.toLowerCase()),
          minimumPurchase: onchainStore
            ? formatUnits(onchainStore.minPurchaseAmount, 18)
            : selectedStore.loyalty.minimumPurchase,
          stampsPerPurchase: String(
            onchainStore?.stampsPerPurchase ?? selectedStore.loyalty.stampsPerPurchase
          ),
          stampsRequired: String(
            onchainStore?.stampsRequired ?? selectedStore.loyalty.stampsRequired
          ),
          rewardType: onchainStore?.rewardType ?? selectedStore.loyalty.rewardType,
          rewardValue: onchainStore
            ? formatUnits(onchainStore.rewardValue, 18)
            : selectedStore.loyalty.rewardValue,
          active: onchainStore?.active ?? true
        });
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
      const configureHash = await configureStoreTx({
        contractAddress,
        storeId,
        payout: getAddress(form.payout) as Hex,
        manager: getAddress(form.manager) as Hex,
        token: getAddress(form.token) as Hex,
        minPurchaseAmount: parseUnits(form.minimumPurchase, 18),
        stampsPerPurchase: Number(form.stampsPerPurchase),
        stampsRequired: Number(form.stampsRequired),
        rewardType: form.rewardType === "free_item" ? 1 : 0,
        rewardValue: parseUnits(form.rewardValue, 18),
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
          rewardValue: form.rewardValue,
          minimumPurchase: form.minimumPurchase
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
          <TextField
            label={locale === "pt-BR" ? "Compra mínima" : "Minimum purchase"}
            value={form.minimumPurchase}
            onChange={(value) => setForm((current) => ({ ...current, minimumPurchase: value }))}
            disabled={!isContractOwner}
          />
          <TextField
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
          <div className="flex items-end">
            <label className="inline-flex items-center gap-3 text-sm text-[#625B78]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.checked
                  }))
                }
                disabled={!isContractOwner}
              />
              {locale === "pt-BR" ? "Loja ativa" : "Store active"}
            </label>
          </div>
        </SectionGrid>

        {isLoading ? <p className="text-sm text-[#625B78]">Loading...</p> : null}
        {status ? <p className="text-sm text-[#2D7A46]">{status}</p> : null}
        {error ? (
          <p className="rounded-[24px] border border-[#F1D9D9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8C3A3A]">
            {error}
          </p>
        ) : null}

        {isContractOwner ? (
          <Button onClick={() => void handleSaveOnchain()} disabled={isSaving}>
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
    </Card>
  );
}
