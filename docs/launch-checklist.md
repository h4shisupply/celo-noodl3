# Launch Checklist

## Contract
- Deploy a fresh incompatible `Noodl3Loyalty` contract on Celo Sepolia.
- Set `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA`.
- Set `NOODL3_CONTRACT_ADDRESS_SEPOLIA` for scripts.
- Run `npm run compile`, `npm run export:abi`, and `npx hardhat test --no-compile`.

## Product
- Confirm a fresh wallet can create a program.
- Confirm program creation requires a public HTTPS icon URL.
- Confirm the program manager opens for owner wallets.
- Confirm fixed QR opens `/app/program/[programId]?visit=static`.
- Confirm static QR collects one stamp and immediate reuse fails before 20 hours.
- Confirm dynamic QR opens `/app/program/[programId]?visit=dynamic&nonce=...&expires=...&sig=...`.
- Confirm dynamic QR can be collected once and fails on reuse.
- Confirm manual stamp works for owner only.
- Confirm customer progress reaches the reward threshold.
- Confirm customer can create a reward claim.
- Confirm owner can consume the reward claim once.

## Frontend
- Check mobile and desktop layouts for:
  - home page
  - `/app`
  - `/app/program/new`
  - `/app/program/[programId]`
  - `/app/program/[programId]/manage`
  - `/app/claim/[claimId]`
- Confirm camera QR scanning works on HTTPS or localhost.
- Confirm old `/app/store/[slug]`, `/store/[slug]`, `/success`, `/rewards`, `/merchant/verify`, and `/verify` routes do not expose catalog checkout.
