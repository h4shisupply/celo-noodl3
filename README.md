# noodl3

`noodl3` is a Celo-native merchant QR stamp card loyalty app for real-world visits.

The app has two main entry points:

- `/`: public landing page
- `/app`: dashboard for customer QR stamp cards, merchant QR stamp cards, visit stamps, manual fallback stamps, and reward tickets

The core loyalty loop is simple:

1. A merchant wallet creates a merchant QR stamp card with a reward promise and a visit goal.
2. The shop owner prints a visit QR or generates a five-minute live visit QR.
3. Customers scan the visit QR and collect one visit stamp (or Selo) per visit.
4. After reaching the configured visit goal, the customer creates a reward ticket.
5. The shop owner completes one-time reward ticket validation with the shop owner wallet and sees the used state.

## Product Shape

- Self-serve merchant QR stamp card creation
- Local visit QR and reward ticket QR rendering, opening links, copying, sharing, downloading SVGs, and printing visit QR counter sheets and reward ticket sheets
- No catalog, menu, cart, item checkout, or payment flow is required for the V1 loyalty loop
- Bilingual runtime copy in Brazilian Portuguese (`pt-BR`) and English
- `Selos` in Brazilian Portuguese and `Stamps` in English
- Accessible app structure with named landmarks, visible focus, hover titles, progress meters, timer labels, full language names for language controls, live regions, QR scanner feedback, and scanner busy states
- Installable app manifest with app description, dashboard and create-card shortcut names, shortcut descriptions, and maskable app and shortcut icons
- Installed app launch handling focuses an existing app window when the platform supports launch handlers
- On-chain loyalty progress per program
- Printed visit QR that lets each wallet collect one visit stamp every 20 hours
- Live visit QR with five-minute, one-use check-in payloads signed by the shop owner wallet
- Manual fallback stamp issuance from shop owner wallets to customer wallets
- Reward ticket QR with a reward ticket sheet and counter backup code for reward ticket validation with the shop owner wallet at the counter
- Internal, non-transferable reward claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: dashboard for customer QR stamp cards, merchant QR stamp cards, visit stamps, manual fallback stamps, and reward tickets
- `/app/program/new`: create a merchant QR stamp card as the shop owner with a square public HTTPS logo URL, a reward promise, and a visit goal
- `/app/program/[programId]`: customer QR stamp card for printed and live visit QR links, manual fallback stamp visibility, progress tracking, and reward ticket creation
- `/app/program/[programId]/manage`: merchant QR stamp card manager for shop owner wallets with printed and live visit QR actions, manual fallback stamps, and reward tickets
- `/app/claim/[claimId]`: reward ticket QR, reward ticket sheet, counter backup code, and one-time reward ticket validation with the shop owner wallet
- `/claim/[claimId]`: legacy reward ticket link that preserves the claim ID when redirecting to `/app/claim/[claimId]`
- `/app/rewards`, `/rewards`, and `/success` redirect to the `/app` dashboard where customer QR stamp cards, merchant QR stamp cards, visit stamps, and reward tickets now live
- `/app/store/[slug]` and `/store/[slug]` redirect to the `/app` QR stamp card dashboard instead of exposing old catalog or checkout surfaces
- `/merchant/verify` and `/verify` preserve `claim` query values when redirecting to `/app/claim/[claimId]`, and links without a `claim` query value redirect to the `/app` dashboard

## Merchant Pilot Flow

For a real pilot, the shop owner should:

1. Create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal.
2. Open the merchant QR stamp card manager and print the visit QR counter sheet.
3. Keep the printed visit QR at the register so customers can collect visit stamps.
4. Use the live visit QR for shop-owner-led check-ins; it expires after five minutes, works once, and can be regenerated.
5. Use manual fallback stamp issuance to add shop-owner-approved fallback visits to a customer wallet when QR scanning is not available.
6. Ask customers with completed QR stamp cards to open their reward ticket QR before validation.
7. Complete one-time reward ticket validation with the shop owner wallet and confirm the used state before handing out the reward.

The QR UI renders QR codes locally in the app. It supports opening and copying QR links, sharing when supported by the browser, downloading QR SVGs, and printing visit QR counter sheets and reward ticket sheets without relying on an external QR image service. QR action feedback clears between actions and when regenerated QR content changes.

## Smart Contract

The app uses a single contract: `contracts/Noodl3Loyalty.sol`.

Core contract methods:

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

- Every static visit, dynamic visit, or manual fallback stamp issuance gives exactly one visit stamp.
- Program IDs are incrementing `uint256` values.
- Program logo URLs must be public HTTPS image URLs stored on-chain with the program.
- Static visit QR lets each wallet collect one visit stamp every 20 hours when enabled.
- Dynamic visit QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; the app generates five-minute expiries, and each check-in nonce can be used once.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward ticket claims are internal records, not NFTs.
- Dashboard reads direct on-chain indexes instead of relying on event indexing.

## Quick Start

Use Node `22.13.0` or newer; `.nvmrc` pins the recommended local Node version, so nvm users can run `nvm use`.

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

After the dev server starts, open `http://localhost:3000/app` to view customer QR stamp cards, merchant QR stamp cards, visit stamps, and reward tickets on the `/app` dashboard.
For phone QR testing on a trusted local network, use `npm run dev:mobile` so the dev server listens on `0.0.0.0` before opening QR links from another device.
Camera-based QR scanning works over HTTPS or on localhost; for phone QR tests against a LAN dev server, use a secure tunnel or HTTPS preview.

## Deploy and Seed

```bash
npm run deploy:sepolia
npm run seed:sepolia
npm run verify:sepolia
```

Mainnet equivalents, intentionally without a default seed step:

```bash
npm run deploy:mainnet
npm run verify:mainnet
```

After deployment, copy the printed address and deployment block into the matching contract address and deployment block environment variables before verification or seeding.

## Environment Notes

- `NEXT_PUBLIC_DEFAULT_CHAIN` should match the deployed contract network: `celoSepolia` during testing and `celo` in production.
- `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_MAINNET` point the app at the deployed loyalty contract after deployment.
- `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_MAINNET` are optional after deployment but useful for tracking and event lookups from the contract launch block.
- `NEXT_PUBLIC_APP_URL` should match the reachable local, LAN, or deployed URL used in shared QR links, phone QR tests, printed QR sheets, and social metadata.
- `CELO_MAINNET_RPC_URL` and `CELO_SEPOLIA_RPC_URL` are server-side endpoints for Hardhat deploy and verify scripts, plus the Sepolia seed script; the `NEXT_PUBLIC_` RPC URLs are browser-visible fallbacks, so keep private or metered providers in server-only variables.
- `ETHERSCAN_API_KEY` or `CELOSCAN_API_KEY` enables Celo explorer verification when running the verify scripts.
- `NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NOODL3_CONTRACT_ADDRESS_MAINNET` are script-only contract addresses used by verify scripts and the Sepolia seed script.
- Locale detection uses the `noodl3_locale` cookie set by the language switcher first, request headers second, and `pt-BR` as the fallback.

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

- [Security policy](./SECURITY.md)
- [License](./LICENSE)
- [Environment example](./.env.example)
- [Pitch outline](./docs/pitch-outline.md)
- [Demo script](./docs/demo-script.md)
- [Launch checklist](./docs/launch-checklist.md)
