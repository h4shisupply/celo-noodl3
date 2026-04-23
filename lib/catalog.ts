import { formatUnits, parseUnits, type Hex } from "viem";
import type { Locale } from "./i18n";
import {
  getPrimaryPaymentToken,
  getSupportedTokens,
  getTokenByAddress,
  type SupportedToken
} from "./tokens";
import { encodeStoreId } from "./store-id";
import { normalizeImageUrl } from "./format";

export type RewardKind = "fixed_amount" | "free_item";

export type LocalizedText = {
  "pt-BR": string;
  en: string;
};

export type LocalizedTextInput = string | Partial<LocalizedText>;

export type MenuItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: string;
  badge?: LocalizedText | null;
};

export type StoreCatalogEntry = {
  slug: string;
  shortCode: string;
  name: LocalizedText;
  storeLogoUrl?: string;
  category: LocalizedText;
  city: LocalizedText;
  accent: string;
  summary: LocalizedText;
  loyalty: {
    stampsPerPurchase: number;
    stampsRequired: number;
    rewardType: RewardKind;
    rewardValue: string;
    minimumPurchase: string;
  };
  menu: MenuItem[];
  onchain?: {
    payout?: Hex;
    manager?: Hex;
    token?: Hex;
    acceptedTokens?: Hex[];
  };
};

export type StoreCatalogInput = {
  slug: string;
  shortCode: string;
  name: LocalizedTextInput;
  storeLogoUrl?: string;
  store_logo_url?: string;
  category: LocalizedTextInput;
  city: LocalizedTextInput;
  accent: string;
  summary: LocalizedTextInput;
  loyalty: {
    stampsPerPurchase: number;
    stampsRequired: number;
    rewardType: RewardKind;
    rewardValue: string;
    minimumPurchase: string;
  };
  menu: Array<{
    id: string;
    name: LocalizedTextInput;
    description: LocalizedTextInput;
    price: string;
    badge?: LocalizedTextInput | null;
  }>;
  onchain?: {
    payout?: Hex;
    manager?: Hex;
    token?: Hex;
    acceptedTokens?: Hex[];
    accepted_tokens?: Hex[];
  };
};

export type StoreSeed = {
  storeId: Hex;
  slug: string;
  payout: Hex;
  manager: Hex;
  token: Hex;
  acceptedTokens: Array<{
    address: Hex;
    decimals: number;
  }>;
  minPurchaseAmount: bigint;
  stampsPerPurchase: number;
  stampsRequired: number;
  rewardType: 0 | 1;
  rewardValue: bigint;
  active: boolean;
};

function normalizeText(value: LocalizedTextInput): LocalizedText {
  if (typeof value === "string") {
    return {
      "pt-BR": value,
      en: value
    };
  }

  const pt = value["pt-BR"] || value.en || "";
  const en = value.en || value["pt-BR"] || "";

  return {
    "pt-BR": pt,
    en
  };
}

function normalizeMenuItem(item: StoreCatalogInput["menu"][number]): MenuItem {
  return {
    id: item.id,
    name: normalizeText(item.name),
    description: normalizeText(item.description),
    price: item.price,
    badge: item.badge ? normalizeText(item.badge) : null
  };
}

export function normalizeStoreCatalog(
  input: StoreCatalogInput[]
): StoreCatalogEntry[] {
  return input.map((store) => ({
    slug: store.slug,
    shortCode: store.shortCode,
    name: normalizeText(store.name),
    storeLogoUrl: normalizeImageUrl(store.storeLogoUrl || store.store_logo_url || "") || undefined,
    category: normalizeText(store.category),
    city: normalizeText(store.city),
    accent: store.accent,
    summary: normalizeText(store.summary),
    loyalty: {
      stampsPerPurchase: store.loyalty.stampsPerPurchase,
      stampsRequired: store.loyalty.stampsRequired,
      rewardType: store.loyalty.rewardType,
      rewardValue: store.loyalty.rewardValue,
      minimumPurchase: store.loyalty.minimumPurchase
    },
    menu: store.menu.map(normalizeMenuItem),
    onchain: store.onchain
      ? {
          ...store.onchain,
          acceptedTokens:
            store.onchain.acceptedTokens || store.onchain.accepted_tokens
        }
      : undefined
  }));
}

const DEFAULT_STORE_INPUT: StoreCatalogInput[] = [
  {
    slug: "cafe-lina",
    shortCode: "LINA",
    name: {
      "pt-BR": "Cafe Lina",
      en: "Cafe Lina"
    },
    category: {
      "pt-BR": "Café especial",
      en: "Specialty coffee"
    },
    city: {
      "pt-BR": "Bela Vista",
      en: "Bela Vista"
    },
    accent: "from-[#7B3FE4] via-[#9E70F0] to-[#E5DAFF]",
    summary: {
      "pt-BR":
        "Cafés, cookies e pausas rápidas com uma jornada de fidelidade simples no MiniPay.",
      en: "Coffee, cookies, and quick breaks with a simple MiniPay loyalty loop."
    },
    loyalty: {
      stampsPerPurchase: 1,
      stampsRequired: 10,
      rewardType: "fixed_amount",
      rewardValue: "8",
      minimumPurchase: "8"
    },
    menu: [
      {
        id: "flat-white",
        name: {
          "pt-BR": "Flat White da Casa",
          en: "House Flat White"
        },
        description: {
          "pt-BR": "Café especial com leite texturizado.",
          en: "Specialty coffee with silky steamed milk."
        },
        price: "12",
        badge: {
          "pt-BR": "Mais pedido",
          en: "Top pick"
        }
      },
      {
        id: "cookie-lina",
        name: {
          "pt-BR": "Cookie de chocolate",
          en: "Chocolate cookie"
        },
        description: {
          "pt-BR": "Cookie macio para acompanhar o café.",
          en: "Soft cookie designed to pair with coffee."
        },
        price: "8",
        badge: {
          "pt-BR": "Combo ideal",
          en: "Easy add-on"
        }
      }
    ]
  },
  {
    slug: "choices-bar",
    shortCode: "CHOI",
    name: {
      "pt-BR": "Choices Bar",
      en: "Choices Bar"
    },
    category: {
      "pt-BR": "Chopp & petiscos",
      en: "Draft beer & snacks"
    },
    city: {
      "pt-BR": "Pinheiros",
      en: "Pinheiros"
    },
    accent: "from-[#17122A] via-[#4F46E5] to-[#B7B5FF]",
    summary: {
      "pt-BR":
        "Um fluxo rápido para pedidos repetidos e resgate de rodada sem atrito.",
      en: "A fast flow for repeat orders and frictionless round-based rewards."
    },
    loyalty: {
      stampsPerPurchase: 1,
      stampsRequired: 10,
      rewardType: "free_item",
      rewardValue: "1",
      minimumPurchase: "12"
    },
    menu: [
      {
        id: "chopp-choices",
        name: {
          "pt-BR": "Um chopp da loja Choices",
          en: "Choices draft beer"
        },
        description: {
          "pt-BR": "Pilsen gelada para a rodada da noite.",
          en: "Cold pilsner for a late-evening round."
        },
        price: "16",
        badge: {
          "pt-BR": "Vira recompensa",
          en: "Reward item"
        }
      },
      {
        id: "batata-crocante",
        name: {
          "pt-BR": "Batata crocante",
          en: "Crispy potatoes"
        },
        description: {
          "pt-BR": "Porção pequena para dividir.",
          en: "Small plate made for sharing."
        },
        price: "18",
        badge: {
          "pt-BR": "Petisco",
          en: "Snack"
        }
      }
    ]
  },
  {
    slug: "nubi-gelato",
    shortCode: "NUBI",
    name: {
      "pt-BR": "Nubi Gelato",
      en: "Nubi Gelato"
    },
    category: {
      "pt-BR": "Sobremesas",
      en: "Desserts"
    },
    city: {
      "pt-BR": "Vila Madalena",
      en: "Vila Madalena"
    },
    accent: "from-[#F59E0B] via-[#F6C453] to-[#FFF0B6]",
    summary: {
      "pt-BR":
        "Gelato e sobremesas com recompensa visual, rápida de entender e simples de validar.",
      en: "Gelato and desserts with rewards that are easy to understand and verify."
    },
    loyalty: {
      stampsPerPurchase: 1,
      stampsRequired: 8,
      rewardType: "fixed_amount",
      rewardValue: "10",
      minimumPurchase: "10"
    },
    menu: [
      {
        id: "gelato-doppio",
        name: {
          "pt-BR": "Gelato doppio",
          en: "Gelato doppio"
        },
        description: {
          "pt-BR": "Dois sabores sazonais.",
          en: "Two seasonal flavors."
        },
        price: "14",
        badge: {
          "pt-BR": "Clássico",
          en: "Classic"
        }
      },
      {
        id: "affogato",
        name: {
          "pt-BR": "Affogato cremoso",
          en: "Creamy affogato"
        },
        description: {
          "pt-BR": "Gelato de baunilha com espresso.",
          en: "Vanilla gelato finished with espresso."
        },
        price: "18",
        badge: {
          "pt-BR": "Premium",
          en: "Premium"
        }
      }
    ]
  }
];

export const DEFAULT_STORE_CATALOG = normalizeStoreCatalog(DEFAULT_STORE_INPUT);

export function resolveText(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export function findStoreBySlug(stores: StoreCatalogEntry[], slug: string) {
  return stores.find((store) => store.slug === slug);
}

export function findItemById(store: StoreCatalogEntry, itemId?: string) {
  if (!itemId) {
    return store.menu[0];
  }

  return store.menu.find((item) => item.id === itemId) || store.menu[0];
}

export function getItemById(
  stores: StoreCatalogEntry[],
  storeSlug: string,
  itemId?: string
) {
  const store = findStoreBySlug(stores, storeSlug);
  if (!store) return undefined;
  return findItemById(store, itemId);
}

export function formatPaymentAmount(
  amount: bigint,
  locale: Locale,
  token: Pick<SupportedToken, "decimals" | "symbol">
) {
  const localeCode = locale === "pt-BR" ? "pt-BR" : "en-US";
  return `${new Intl.NumberFormat(localeCode, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(formatUnits(amount, token.decimals)))} ${token.symbol}`;
}

export function formatPaymentAmountFromString(
  value: string,
  locale: Locale,
  token: Pick<SupportedToken, "decimals" | "symbol">
) {
  return formatPaymentAmount(parseUnits(value, token.decimals), locale, token);
}

export function buildRewardCopy(
  store: Pick<StoreCatalogEntry, "loyalty">,
  locale: Locale
) {
  if (store.loyalty.rewardType === "free_item") {
    return locale === "pt-BR"
      ? `${store.loyalty.rewardValue} item grátis`
      : `${store.loyalty.rewardValue} free item`;
  }

  return locale === "pt-BR"
    ? `${store.loyalty.rewardValue} de desconto`
    : `${store.loyalty.rewardValue} off`;
}

export function buildStampRuleCopy(
  store: Pick<StoreCatalogEntry, "loyalty">,
  locale: Locale
) {
  const unit = locale === "pt-BR" ? "Selo" : "Stamp";
  const count = store.loyalty.stampsPerPurchase;
  const plural =
    locale === "pt-BR"
      ? count > 1
        ? "s"
        : ""
      : count > 1
        ? "s"
        : "";

  return locale === "pt-BR"
    ? `${count} ${unit}${plural} por pagamento elegível`
    : `${count} ${unit}${plural} per eligible payment`;
}

export function buildStoreSeeds(params: {
  chainId: number;
  manager: Hex;
  payout: Hex;
  stores?: StoreCatalogEntry[];
}) {
  const stores = params.stores ?? DEFAULT_STORE_CATALOG;
  const defaultToken = getPrimaryPaymentToken(params.chainId)?.address;

  return stores.map<StoreSeed>((store) => ({
    acceptedTokens: (
      store.onchain?.acceptedTokens?.length
        ? store.onchain.acceptedTokens
        : getSupportedTokens(params.chainId).map((token) => token.address)
    ).map((address) => {
      const token = getTokenByAddress(address, params.chainId);
      if (!token) {
        throw new Error(`Unsupported payment token in catalog: ${address}`);
      }

      return {
        address: token.address,
        decimals: token.decimals
      };
    }),
    storeId: encodeStoreId(store.slug),
    slug: store.slug,
    payout: store.onchain?.payout ?? params.payout,
    manager: store.onchain?.manager ?? params.manager,
    token:
      store.onchain?.token ??
      defaultToken ??
      getSupportedTokens(params.chainId)[0].address,
    minPurchaseAmount: parseUnits(store.loyalty.minimumPurchase, 18),
    stampsPerPurchase: store.loyalty.stampsPerPurchase,
    stampsRequired: store.loyalty.stampsRequired,
    rewardType: store.loyalty.rewardType === "free_item" ? 1 : 0,
    rewardValue: parseUnits(store.loyalty.rewardValue, 18),
    active: true
  }));
}
