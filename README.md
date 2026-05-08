# noodl3

`noodl3` is a Celo-native loyalty app for real-world visit stamp cards.

The product is split into two layers:

- `/`: public landing page
- `/app`: wallet-aware customer, owner, and staff experience for loyalty programs, visit stamps, and reward claims

The core loop is simple:

1. A wallet creates a loyalty program.
2. The owner prints a fixed QR or generates a short-lived dynamic QR.
3. Customers scan the QR and collect one Stamp / Selo per visit.
4. When the threshold is reached, the customer creates a reward claim.
5. Owner or staff validates and consumes the reward claim once.

## Product Shape

- Self-serve loyalty program creation
- No catalog, menu, cart, item checkout, or payment requirement in V1
- Bilingual runtime copy: `pt-BR` and `English`
- `Selos` in Portuguese and `Stamps` in English
- Onchain loyalty progress per program
- Static visit QR with staff approval
- Dynamic visit QR with one-use signed payloads
- Internal non-transferable claims instead of points tokens or NFTs

## Routes

- `/`: landing page
- `/app`: unified dashboard
- `/app/program/new`: create a loyalty program
- `/app/program/[programId]`: customer stamp card and QR landing page
- `/app/program/[programId]/manage`: owner/staff manager
- `/app/claim/[claimId]`: reward claim QR and staff validation
- `/rewards`, `/merchant/verify`, `/verify`, `/success`, and old store URLs redirect into `/app`

## Smart Contract

The app uses a single contract: `contracts/Noodl3Loyalty.sol`.

Core methods:

- `createProgram(name, rewardDescription, stampsRequired, active)`
- `updateProgram(programId, name, rewardDescription, stampsRequired, active)`
- `setProgramStaff(programId, staff, enabled)`
- `requestVisit(programId)`
- `approveVisitRequest(requestId)`
- `rejectVisitRequest(requestId)`
- `issueManualStamp(programId, customer)`
- `collectDynamicStamp(programId, nonce, expiresAt, signature)`
- `claimReward(programId)`
- `consumeReward(claimId)`
- `getProgram(programId)`
- `getProgress(user, programId)`
- `getOwnerProgramIds(owner)`
- `getStaffProgramIds(staff)`
- `getUserProgramIds(user)`
- `getProgramParticipants(programId)`
- `getProgramVisitRequestIds(programId)`
- `getUserClaimIds(user)`
- `getProgramClaimIds(programId)`
- `getClaim(claimId)`

Design choices:

- Every approved, dynamic, or manual visit gives exactly one stamp.
- Program IDs are incrementing `uint256` values.
- Static QR opens a visit request that owner/staff must approve.
- Dynamic QR signs `chainId`, `contract`, `programId`, `nonce`, and `expiresAt`; each nonce can be used once.
- Progress is stored as `mapping(user => mapping(programId => uint32))`.
- Reward claims are internal records, not NFTs.
- Dashboard reads direct onchain indexes instead of requiring event indexing.

## Quick Start

Use Node `22.13.0` or newer.

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
- `NOODL3_CONTRACT_ADDRESS_SEPOLIA` and `NOODL3_CONTRACT_ADDRESS_MAINNET` are used by scripts.
- Locale detection uses the `noodl3_locale` cookie first and request headers second.

## Release Checks

```bash
npm run compile
npm run export:abi
npx hardhat test --no-compile
npm run lint
npm run typecheck
npm run build
```

## Docs

- [docs/pitch-outline.md](./docs/pitch-outline.md)
- [docs/demo-script.md](./docs/demo-script.md)
- [docs/launch-checklist.md](./docs/launch-checklist.md)
