# noodl3

`noodl3` is a Celo-native merchant QR stamp card loyalty app for real-world visits.

The product is split into two layers:

- `/`: public landing page
- `/app`: dashboard for customer and merchant QR stamp cards, visit stamps, and reward tickets

The core loop is simple:

1. A merchant wallet creates a merchant QR stamp card with a reward promise and a visit goal.
2. The shop owner prints a visit QR or generates a five-minute live visit QR.
3. Customers scan the visit QR and collect one Stamp or Selo per visit.
4. When the configured visit goal is reached, the customer creates a reward ticket.
5. The shop owner validates the reward ticket once from the shop owner wallet.

## Product Shape

- Self-serve merchant QR stamp card creation
- Local visit QR and reward ticket QR rendering, link opening, copying, sharing, SVG download, and printed visit QR counter sheets and printable reward ticket sheets
- No catalog, menu, cart, item checkout, or payment requirement in V1
- Bilingual runtime copy: `pt-BR` and English
- `Selos` in Portuguese and `Stamps` in English
- Accessible app structure with named landmarks, visible focus, progress meters, timer labels, live regions, and QR scanner feedback
- Installable app manifest with app description, dashboard and create-card shortcut names and descriptions, and maskable icons
- Installed app launch handling prefers an existing app window when the platform supports launch handlers
- On-chain loyalty progress per program
- Printed visit QR that lets each wallet collect one stamp every 20 hours
- Live visit QR with five-minute, one-use check-in payloads signed by the shop owner wallet
- Reward ticket QR with a printable reward ticket sheet and counter backup code for shop owner wallet validation
- Internal non-transferable claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: dashboard for customer and merchant QR stamp cards, visit stamps, and reward tickets
- `/app/program/new`: create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal
- `/app/program/[programId]`: customer QR stamp card for printed and live visit QR links
- `/app/program/[programId]/manage`: merchant QR stamp card manager for printed and live visit QR actions
- `/app/claim/[claimId]`: reward ticket QR, printable reward ticket sheet, counter backup code, and shop owner wallet validation
- `/claim/[claimId]`: legacy reward ticket link that preserves the claim ID when redirecting to `/app/claim/[claimId]`
- `/app/rewards`, `/rewards`, `/success`, `/app/store/[slug]`, and `/store/[slug]` redirect to the `/app` dashboard; `/merchant/verify` and `/verify` preserve `claim` query values when redirecting to `/app/claim/[claimId]`, and redirect to `/app` otherwise

## Merchant Pilot Flow

For a real pilot, the shop owner should:

1. Create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal.
2. Open the merchant QR stamp card manager and print the visit QR counter sheet.
3. Keep the printed visit QR at the register so customers can collect visit stamps.
4. Use the live visit QR for shop-owner-led check-ins; it expires after five minutes and can be regenerated.
5. Ask customers with completed QR stamp cards to open their reward ticket QR before validation.
6. Validate the reward ticket from the shop owner wallet and confirm the used state before handing out the reward.

The QR UI renders locally in the app. It supports opening QR links, copying links, sharing when the browser allows it, downloading the SVG QR, and printing visit QR counter sheets and printable reward ticket sheets without relying on an external QR image service. QR action feedback clears between actions and when regenerated QR content changes.

## Smart Contract

The app uses a single contract: `contracts/Noodl3Loyalty.sol`.

Core methods:

- `createProgram(name, iconUrl, rewardDescription, stampsRequired, active, staticStampEnabled)`
- `updateProgram(programId, name, iconUrl, rewardDescription, stampsRequired, active, staticStampEnabled)`
- `collectStaticStamp(programId)`
- `getLastStaticStampAt(user, programId)`
- `issueManualStamp(programId, customer)`
- `collectDynamicStamp(programId, nonce, expiresAt, signature)`
- `claimReward(programId)`
- `consumeReward(claimId)`
- `getProgram(programId)`
- `getProgress(user, programId)`
- `getOwnerProgramIds(owner)`
- `getUserProgramIds(user)`
- `getProgramParticipants(programId)`
- `getUserClaimIds(user)`
- `getProgramClaimIds(programId)`
- `getClaim(claimId)`

Design choices:

- Every static, dynamic, or manual visit gives exactly one stamp.
- Program IDs are incrementing `uint256` values.
- Program logo URLs are required public HTTPS image URLs stored on-chain with the program.
- Static visit QR lets each wallet collect one stamp every 20 hours when enabled.
- Dynamic visit QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; the app generates five-minute expiries, and each check-in nonce can be used once.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward ticket claims are internal records, not NFTs.
- Dashboard reads direct on-chain indexes instead of relying on event indexing.

## Quick Start

Use Node `22.13.0` or newer; `.nvmrc` pins the local development version.

```bash
npm install
cp .env.example .env
npm run compile
npm run export:abi
npm run lint
npm run typecheck
npm run build
npm run dev
```

After the dev server starts, open `http://localhost:3000/app` to view customer and merchant QR stamp cards, visit stamps, and reward tickets on the `/app` dashboard.
For QR testing from phones on the same network, use `npm run dev:mobile` so the dev server listens on `0.0.0.0`.
Camera QR scanning requires HTTPS or a localhost demo URL.

## Deploy And Seed

```bash
npm run deploy:sepolia
npm run seed:sepolia
npm run verify:sepolia
```

Mainnet equivalents, without a default seed step:

```bash
npm run deploy:mainnet
npm run verify:mainnet
```

## Environment Notes

- `NEXT_PUBLIC_DEFAULT_CHAIN` should be `celoSepolia` during testing and `celo` in production.
- `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_MAINNET` point the app at the deployed loyalty contract.
- `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_MAINNET` are optional but useful for deployment tracking.
- `NEXT_PUBLIC_APP_URL` should match the reachable local, LAN, or deployed URL used in shared QR links and social metadata.
- `CELO_MAINNET_RPC_URL` and `CELO_SEPOLIA_RPC_URL` are server-side endpoints for Hardhat and scripts; the `NEXT_PUBLIC_` RPC URLs are browser-visible fallbacks, so keep private or metered providers in server-only variables.
- `ETHERSCAN_API_KEY` or `CELOSCAN_API_KEY` enables explorer verification when running the verify scripts.
- `NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NOODL3_CONTRACT_ADDRESS_MAINNET` are script-only contract addresses used by deploy, verify, and seed scripts.
- Locale detection uses the `noodl3_locale` cookie first and request headers second.

## Release Checks

```bash
npm run compile
npm run export:abi
npm run test
npm run lint
npm run typecheck
npm run build
```

## Docs

- [SECURITY.md](./SECURITY.md)
- [LICENSE](./LICENSE)
- [.env.example](./.env.example)
- [docs/pitch-outline.md](./docs/pitch-outline.md)
- [docs/demo-script.md](./docs/demo-script.md)
- [docs/launch-checklist.md](./docs/launch-checklist.md)
