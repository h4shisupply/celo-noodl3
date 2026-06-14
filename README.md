# noodl3

`noodl3` is a Celo-native merchant QR stamp card loyalty app for real-world visits.

The product is split into two layers:

- `/`: public landing page
- `/app`: customer and owner dashboard for customer QR stamp cards, visit stamps, and reward ticket history

The core loop is simple:

1. A merchant wallet creates a merchant QR stamp card with a reward promise and customer visit goal.
2. The owner prints a visit QR or generates a five-minute live visit QR.
3. Customers scan the visit QR and collect one Stamp / Selo per visit.
4. When the customer visit goal is reached, the customer creates a reward ticket.
5. The owner validates the reward ticket once from the owner wallet.

## Product Shape

- Self-serve merchant QR stamp card creation
- Local visit QR and reward ticket QR rendering, link opening, copying, sharing, SVG download, and printed visit QR counter sheets and reward ticket sheets
- No catalog, menu, cart, item checkout, or payment requirement in V1
- Bilingual runtime copy: `pt-BR` and `English`
- `Selos` in Portuguese and `Stamps` in English
- Accessible app structure with named landmarks, visible focus, progress meters, timer labels, and live QR scanner feedback
- Installable app manifest with app, dashboard shortcut, and create-card shortcut descriptions plus maskable icons
- Installed app launches prefer an existing app window when supported
- Onchain loyalty progress per program
- Printed visit QR with one stamp per wallet every 20 hours
- Live visit QR with five-minute, one-use owner-signed check-in payloads
- Reward ticket QR with a reward ticket sheet and counter backup code for owner wallet validation
- Internal non-transferable claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: customer and owner dashboard for customer QR stamp cards, visit stamps, and reward ticket history
- `/app/program/new`: create a merchant QR stamp card with an HTTPS logo URL, reward promise, and customer visit goal
- `/app/program/[programId]`: customer QR stamp card for printed and live visit QR links
- `/app/program/[programId]/manage`: merchant QR stamp card manager for printed and live visit QR actions
- `/app/claim/[claimId]`: reward ticket QR, reward ticket sheet, counter backup code, and owner wallet validation
- `/claim/[claimId]`: legacy reward ticket link that preserves the claim ID when redirecting into `/app/claim/[claimId]`
- `/app/rewards`, `/rewards`, `/success`, `/app/store/[slug]`, and `/store/[slug]` redirect into the `/app` dashboard; `/merchant/verify` and `/verify` preserve `claim` query values when redirecting into `/app/claim/[claimId]`, or into `/app` otherwise

## Merchant Pilot Flow

For a real pilot, the owner should:

1. Create a merchant QR stamp card with a square HTTPS logo URL, reward promise, and customer visit goal.
2. Open the merchant QR stamp card manager and print the visit QR counter sheet.
3. Keep the printed visit QR at the register so customers can collect visit stamps.
4. Use the live visit QR for owner-led check-ins; it expires after five minutes and can be regenerated.
5. Ask customers with completed stamp cards to open their reward ticket QR before validation.
6. Validate the reward ticket from the owner wallet and confirm the used state before handing out the reward.

The QR UI renders locally in the app. It supports opening QR links, copying links, sharing where the browser allows it, downloading the SVG QR, and printing visit QR counter sheets and reward ticket sheets without relying on an external QR image service. QR action feedback clears between actions and when regenerated QR content changes.

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
- Program logo URLs are required HTTPS URLs stored onchain with the program.
- Static visit QR lets each wallet collect one stamp every 20 hours when enabled.
- Dynamic visit QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; the app generates five-minute expiries, and each check-in nonce can be used once.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward ticket claims are internal records, not NFTs.
- Dashboard reads direct onchain indexes instead of relying on event indexing.

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

After the dev server starts, open `http://localhost:3000/app` to view customer QR stamp cards, visit stamps, and reward ticket history in the customer and owner dashboard.
For phone-based QR testing on the same network, use `npm run dev:mobile` so the dev server listens on `0.0.0.0`.

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
- `CELO_MAINNET_RPC_URL` and `CELO_SEPOLIA_RPC_URL` are server-side endpoints for Hardhat and scripts; the `NEXT_PUBLIC_` RPC URLs are browser-visible fallbacks, so keep private or metered providers in the non-public variables.
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
