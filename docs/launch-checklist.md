# Launch Checklist

## Contract
- Deploy a fresh incompatible `Noodl3Loyalty` contract on Celo Sepolia.
- Set `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_SEPOLIA`.
- Set `NOODL3_CONTRACT_ADDRESS_SEPOLIA` for scripts.
- Set `ETHERSCAN_API_KEY` or `CELOSCAN_API_KEY` before explorer verification.
- Run `npm run compile`, `npm run export:abi`, and `npm run test`.

## Product
- Confirm a fresh wallet can create a program.
- Confirm program creation requires a public HTTPS icon URL.
- Confirm the program manager opens for owner wallets.
- Confirm the program manager back link returns to the program card.
- Confirm the account menu can open the profile dialog, save a display name, and skip profile setup.
- Confirm fixed QR opens `/app/program/[programId]?visit=static`.
- Confirm fixed QR renders locally without a third-party QR image URL.
- Confirm fixed QR copy, share fallback, SVG download, and print sheet actions work.
- Confirm visible and printable QR images expose accessible names.
- Confirm QR open actions launch the visit or claim link in a separate tab.
- Confirm QR open actions do not send the current app page as the referrer.
- Confirm static QR collects one stamp and immediate reuse fails before 20 hours.
- Confirm dynamic QR opens `/app/program/[programId]?visit=dynamic&nonce=...&expires=...&sig=...`.
- Confirm dynamic QR shows a countdown, expires after five minutes, and can be regenerated.
- Confirm dynamic QR generation shows an in-progress label while the action is disabled.
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
- Confirm wallet addresses, dates, and reward codes do not get auto-linked by mobile browser format detection.
- Confirm keyboard focus is visible on header links, account menu controls, QR actions, and form fields.
- Confirm loading actions expose their busy state while disabled.
- Confirm app pages expose a named main landmark from the visible page heading.
- Confirm landing page grouped stats, checklists, and card grids use semantic list or description-list markup.
- Confirm dashboard cards, reward tickets, customer summaries, and metrics use semantic list or description-list markup.
- Confirm status updates and QR scanner feedback announce through live regions.
- Confirm menu toggles expose expanded state and announce the close action while open.
- Confirm decorative and remote UI images stay non-blocking and hidden from assistive tech when appropriate.
- Confirm Escape closes temporary overlays such as the mobile menu, account menu, profile dialog, and QR scanner.
- Confirm mobile landing navigation opens, closes, and keeps the language switcher and CTA reachable.
- Confirm the language switcher announces the current language and selected state.
- Confirm language selection persists after refresh through the locale cookie.
- Confirm the app manifest icon, dashboard and create-program shortcuts, language, theme color, standalone display mode, and portrait orientation work when installed on mobile.
- Confirm social preview metadata resolves against `NEXT_PUBLIC_APP_URL` and shows the expected title, description, and image.
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
