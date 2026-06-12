# noodl3

`noodl3` is a Celo-native QR stamp-card loyalty app for real-world visits.

The product is split into two layers:

- `/`: public landing page
- `/app`: wallet-aware customer and owner experience for QR stamp cards, visit stamps, and reward tickets

The core loop is simple:

1. A wallet creates a QR stamp card.
2. The owner prints a visit QR or generates a five-minute live visit QR.
3. Customers scan the visit QR and collect one Stamp / Selo per visit.
4. When the reward threshold is reached, the customer creates a reward ticket.
5. The owner validates the reward ticket once.

## Product Shape

- Self-serve QR stamp card creation
- Local visit and reward QR rendering, link opening, copying, sharing, SVG download, and printable visit QR counter sheets and reward ticket sheets
- No catalog, menu, cart, item checkout, or payment requirement in V1
- Bilingual runtime copy: `pt-BR` and `English`
- `Selos` in Portuguese and `Stamps` in English
- Accessible app structure with named landmarks, visible focus, progress meters, timer labels, and live QR scanner feedback
- Installable app manifest with dashboard and create QR stamp card shortcut descriptions plus maskable icons
- Installed launches prefer the existing app window when supported
- Onchain loyalty progress per program
- Printed visit QR with one stamp per wallet every 20 hours
- Live visit QR with five-minute, one-use owner-signed check-in payloads
- Reward ticket QR with backup codes for owner counter validation
- Internal non-transferable claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: unified dashboard
- `/app/program/new`: create a QR stamp card with a reward promise and visit goal
- `/app/program/[programId]`: customer QR stamp card and visit landing page
- `/app/program/[programId]/manage`: owner visit QR and reward manager
- `/app/claim/[claimId]`: reward ticket QR and owner validation
- `/claim/[claimId]`: legacy reward ticket link that redirects into `/app/claim/[claimId]`
- `/app/rewards`, `/rewards`, `/success`, `/app/store/[slug]`, and `/store/[slug]` redirect into the `/app` dashboard; `/merchant/verify` and `/verify` send `claim` query links to `/app/claim/[claimId]` when present, or to `/app` otherwise

## Merchant Pilot Flow

For a real pilot, the owner should:

1. Create a QR stamp card with a square HTTPS icon, reward promise, and visit goal.
2. Open the manager view and print the visit QR counter sheet.
3. Keep the printed visit QR at the register so customers can collect visit stamps.
4. Use the live visit QR for owner-led check-ins; it expires after five minutes and can be regenerated.
5. Ask customers with full stamp cards to open their reward ticket QR.
6. Validate the reward ticket from the owner wallet and confirm the used state before handing out the reward.

The QR UI renders locally in the app. It supports opening QR links, copying links, sharing where the browser allows it, downloading the SVG QR, and printing the visit QR counter sheet without relying on an external QR image service. QR action feedback clears between actions and when regenerated QR values change.

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
- Program icon URLs are required HTTPS URLs stored onchain with the program.
- Static visit QR lets each wallet collect one stamp every 20 hours when enabled.
- Dynamic visit QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; the app generates five-minute expiries, and each check-in nonce can be used once.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward ticket claims are internal records, not NFTs.
- Dashboard reads direct onchain indexes instead of requiring event indexing.

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

After the dev server starts, open `http://localhost:3000/app` for the wallet-aware QR stamp card dashboard.
For phone-based QR testing on the same network, use `npm run dev:mobile` so the dev server binds to `0.0.0.0`.

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
- `CELO_MAINNET_RPC_URL` and `CELO_SEPOLIA_RPC_URL` are server-side endpoints for Hardhat and scripts; the `NEXT_PUBLIC_` RPC URLs are browser-visible fallbacks, so keep private or metered providers in the non-public vars.
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
