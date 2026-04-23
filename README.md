# noodl3

`noodl3` is a MiniPay-native loyalty app for local food and drink stores on Celo.

Built and maintained as a H4shi project.

The product is split into two layers:

- `/`: public landing page
- `/app`: wallet-aware customer experience for store discovery, QR payments, rewards, and claims

The core loop is simple:

1. The customer finds a store or scans a purchase QR.
2. The customer pays in a supported stablecoin.
3. The contract forwards funds to the store payout wallet and updates that store's Stamp balance.
4. When the threshold is reached, the customer creates a claim.
5. The cashier validates and consumes the claim from the merchant mode inside `/app`.

## Product shape

- Public LP plus customer app shell
- Bilingual runtime copy: `pt-BR` and `English`
- `Selos` in Portuguese and `Stamps` in English
- Store catalog loaded from defaults or `NOODL3_STORE_CATALOG_JSON`
- `npm run use:test-catalog` to inject the Sepolia test catalog into `.env`
- Onchain loyalty progress per store
- Internal non-transferable claims instead of points tokens or NFTs
- A single `/app` dashboard with customer and merchant modes

## Routes

- `/`: landing page
- `/app`: unified customer and merchant dashboard
- `/app/store/[slug]`: store detail and checkout
- `/app/claim/[claimId]`: customer claim QR
- `/success`: shared transaction confirmation state
- `/rewards`, `/merchant/verify`, and `/verify`: compatibility redirects into `/app`

## Smart contract

The app uses a single contract: `contracts/Noodl3Loyalty.sol`.

Core methods:

- `configureStore(...)`
- `configureStoreAcceptedTokens(storeId, tokens, decimals)`
- `purchase(storeId, paymentToken, amount, itemRef)`
- `claimReward(storeId)`
- `consumeReward(claimId)`
- `getStore(storeId)`
- `getProgress(user, storeId)`
- `getStoreParticipants(storeId)`
- `getUserClaimIds(user)`
- `getStoreClaimIds(storeId)`
- `getClaim(claimId)`

Design choices:

- Progress is stored as `mapping(user => mapping(storeId => uint32))`
- Claims are internal records, not NFTs
- Store IDs are `bytes32` values derived from stable slugs
- Merchant dashboards read customer lists directly from onchain participant indexing
- Customer and merchant reward history read from direct onchain claim indexes

## Store catalog

The repo ships with three configured stores:

- `Cafe Lina`
- `Choices Bar`
- `Nubi Gelato`

The catalog can be overridden with:

- `NOODL3_STORE_CATALOG_JSON`

```ts
type StoreConfig = {
  slug: string;
  shortCode: string;
  name: string | { "pt-BR"?: string; en?: string };
  store_logo_url?: string;
  category: string | { "pt-BR"?: string; en?: string };
  city: string | { "pt-BR"?: string; en?: string };
  accent: string;
  summary: string | { "pt-BR"?: string; en?: string };
  loyalty: {
    stampsPerPurchase: number;
    stampsRequired: number;
    rewardType: "fixed_amount" | "free_item";
    rewardValue: string;
    minimumPurchase: string;
  };
  menu: Array<{
    id: string;
    name: string | { "pt-BR"?: string; en?: string };
    description: string | { "pt-BR"?: string; en?: string };
    price: string;
    badge?: string | { "pt-BR"?: string; en?: string };
  }>;
  onchain?: {
    payout?: `0x${string}`;
    manager?: `0x${string}`;
    token?: `0x${string}`;
    acceptedTokens?: `0x${string}`[];
  };
};
```

The same catalog powers:

- landing page featured stores
- `/app` search and store discovery
- item menus and reward copy
- seed script input
- merchant manager detection

Ready-to-use examples:

- Sepolia test catalog with `0.01` stablecoin-priced items and rewards in `2` stamps:
  [docs/sepolia-test-store-catalog.json](./docs/sepolia-test-store-catalog.json)
- Mainnet example with explicit `onchain.manager`, `onchain.payout`, and accepted stablecoin tokens:
  [docs/mainnet-store-catalog.example.json](./docs/mainnet-store-catalog.example.json)

## Quick start

Use Node `22.13.0` or newer.

```bash
npm install
cp .env.example .env
npm run use:test-catalog
npm run compile
npm run lint
npm run typecheck
npm run build
npm run dev
```

## Repo hygiene

- Do not commit generated or vendor paths such as `node_modules/`, `.next/`, `.home/`, `artifacts/`, `cache/`, or `tsconfig.tsbuildinfo`.
- Keep `lib/abi.ts` tracked as the runtime ABI source and regenerate local contract outputs with `npm run compile` plus `npm run export:abi` when needed.

## Deploy and seed

```bash
npm run deploy:sepolia
npm run seed:sepolia
npm run verify:sepolia
```

Mainnet equivalents:

```bash
npm run deploy:mainnet
npm run verify:mainnet
```

## Environment notes

- `NEXT_PUBLIC_DEFAULT_CHAIN` should be `celoSepolia` during testing and `celo` in production.
- The app accepts the main Celo stablecoins: `USDT`, `USDC`, and `cUSD`.
- `NOODL3_SEED_MANAGER_ADDRESS` and `NOODL3_SEED_PAYOUT_ADDRESS` are optional. When omitted, the seed script falls back to the deployer wallet.
- `NOODL3_STORE_CATALOG_JSON` is optional on Sepolia, but required when `NEXT_PUBLIC_DEFAULT_CHAIN=celo`.
- `store_logo_url` is optional. It can be an `https://` URL or a root-relative asset such as `/store-logos/cafe-lina.svg`. When omitted or invalid, the UI falls back to a placeholder with store initials.
- Locale detection uses the `noodl3_locale` cookie first and request headers second.

## Release checks

```bash
npm run compile
npm run lint
npm run typecheck
npm run build
```

## Docs

- [docs/pitch-outline.md](./docs/pitch-outline.md)
- [docs/demo-script.md](./docs/demo-script.md)
- [docs/launch-checklist.md](./docs/launch-checklist.md)
