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
- Confirm the account menu can open the profile dialog, save a display name, and skip profile setup.
- Confirm fixed QR opens `/app/program/[programId]?visit=static`.
- Confirm fixed QR renders locally without a third-party QR image URL.
- Confirm fixed QR copy, share fallback, SVG download, and print sheet actions work.
- Confirm static QR collects one stamp and immediate reuse fails before 20 hours.
- Confirm dynamic QR opens `/app/program/[programId]?visit=dynamic&nonce=...&expires=...&sig=...`.
- Confirm dynamic QR shows a countdown, expires after five minutes, and can be regenerated.
- Confirm dynamic QR can be collected once and fails on reuse.
- Confirm malformed or expired dynamic QR links show clear user-facing states.
- Confirm manual stamp works for owner only.
- Confirm customer progress reaches the reward threshold.
- Confirm customer can create a reward claim.
- Confirm reward claim QR renders locally and shows the backup code prominently.
- Confirm owner can consume the reward claim once.
- Confirm non-owner wallets see the owner-wallet validation hint.

## Frontend
- Confirm `NEXT_PUBLIC_APP_URL` matches the local or deployed base URL before sharing or printing QR links.
- Confirm keyboard focus is visible on header links, account menu controls, QR actions, and form fields.
- Check mobile and desktop layouts for:
  - home page
  - `/app`
  - `/app/program/new`
  - `/app/program/[programId]`
  - `/app/program/[programId]/manage`
  - `/app/claim/[claimId]`
- Confirm camera QR scanning works on HTTPS or localhost.
- Confirm print output shows only the counter sheet or reward ticket sheet.
- Confirm old `/app/store/[slug]`, `/store/[slug]`, `/success`, `/rewards`, `/merchant/verify`, and `/verify` routes do not expose catalog checkout.
