# noodl3

`noodl3` is a Celo-native QR stamp-card loyalty app for real-world visits.

The product is split into two layers:

- `/`: public landing page
- `/app`: wallet-aware customer and owner experience for QR stamp cards, visit stamps, and reward claims

The core loop is simple:

1. A wallet creates a QR stamp card.
2. The owner prints a fixed visit QR or generates a short-lived dynamic visit QR.
3. Customers scan the visit QR and collect one Stamp / Selo per visit.
4. When the threshold is reached, the customer creates a reward claim.
5. The owner validates and consumes the reward claim once.

## Product Shape

- Self-serve QR stamp card creation
- Local visit and reward QR rendering, sharing, SVG download, and printable counter sheets
- No catalog, menu, cart, item checkout, or payment requirement in V1
- Bilingual runtime copy: `pt-BR` and `English`
- `Selos` in Portuguese and `Stamps` in English
- Accessible app structure with named landmarks, visible focus, progress meters, timer labels, and live QR scanner feedback
- Installable app manifest with dashboard/create QR stamp card shortcut descriptions and maskable icons
- Installed launches prefer the existing app window when supported
- Onchain loyalty progress per program
- Static visit QR with one stamp per wallet every 20 hours
- Dynamic visit QR with one-use owner-signed payloads
- Reward ticket QR with backup codes for counter validation
- Internal non-transferable claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: unified dashboard
- `/app/program/new`: create a QR stamp card
- `/app/program/[programId]`: customer QR stamp card and visit landing page
- `/app/program/[programId]/manage`: owner visit QR and reward manager
- `/app/claim/[claimId]`: reward ticket QR and owner validation
- `/claim/[claimId]`: legacy reward claim link that redirects into `/app/claim/[claimId]`
- `/app/rewards`, `/rewards`, `/merchant/verify`, `/verify`, `/success`, and old store URLs redirect into the `/app` dashboard

## Merchant Pilot Flow

For a real pilot, the owner should:

1. Create a QR stamp card with a square HTTPS icon, reward text, and visit count.
2. Open the manager view and print the counter sheet for the fixed visit QR.
3. Keep the printed QR at the register for customer self-stamps.
4. Use the dynamic visit QR for owner-led check-ins; it expires after five minutes and can be regenerated.
5. Ask customers with full cards to open their reward ticket QR.
6. Validate the ticket from the owner wallet and confirm the used state before handing out the reward.

The QR UI renders locally in the app. It supports copying, sharing where the browser allows it, downloading the SVG QR, and printing the counter sheet without relying on an external QR image service. QR action feedback clears between actions and regenerated QR values.

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
- Static QR lets each wallet collect one stamp every 20 hours when enabled.
- Dynamic QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; each nonce can be used once and must be signed by the owner.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward claims are internal records, not NFTs.
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

Mainnet equivalents:

```bash
npm run deploy:mainnet
npm run verify:mainnet
```

## Environment Notes

- `NEXT_PUBLIC_DEFAULT_CHAIN` should be `celoSepolia` during testing and `celo` in production.
- `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_MAINNET` point the app at the deployed loyalty contract.
- `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_SEPOLIA` and `NEXT_PUBLIC_NOODL3_CONTRACT_DEPLOYMENT_BLOCK_MAINNET` are optional but useful for deployment tracking.
- `NEXT_PUBLIC_APP_URL` should match the reachable local, LAN, or deployed URL used in shared QR links and social metadata.
- `CELO_MAINNET_RPC_URL` and `CELO_SEPOLIA_RPC_URL` are used by Hardhat and scripts; the `NEXT_PUBLIC_` RPC URLs are browser-visible fallbacks, so keep private or metered providers in the non-public vars.
- `ETHERSCAN_API_KEY` or `CELOSCAN_API_KEY` enables explorer verification when running the verify scripts.
- `NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NOODL3_CONTRACT_ADDRESS_MAINNET` are used by scripts.
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
