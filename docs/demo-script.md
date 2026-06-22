# Demo Script

Use separate shop owner and customer wallets, or separate browser profiles, so wallet-gated states stay easy to distinguish during the demo. Confirm `NEXT_PUBLIC_APP_URL` matches the reachable local, LAN, or deployed URL and `NEXT_PUBLIC_DEFAULT_CHAIN` matches the deployed contract network before showing QR links on customer phones or printing QR sheets. For phone QR scans against a LAN dev server, use a secure tunnel or HTTPS preview.

1. Open the landing page and explain the product in one sentence: a Celo-native merchant QR stamp card loyalty app for real-world visits.
2. Switch languages once, refresh, and confirm the landing page, header, and app entry copy remain in sync.
3. Open `/app`, connect a wallet, optionally add a display name, and create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal.
4. Open the merchant QR stamp card manager and show the printed visit QR actions: open the link, copy the link, use the share fallback, download the SVG, and print the visit QR counter sheet.
5. Open the printed visit QR as a customer, collect one visit stamp, and confirm immediate reuse is blocked by the 20-hour cooldown.
6. Generate a live visit QR over HTTPS or on localhost, show the five-minute countdown, scan it as a customer, and collect one visit stamp instantly.
7. Show the QR scanner status before scanning, including permission guidance when relevant, the busy state during QR processing, and the success feedback after the stamp is recorded.
8. Regenerate the live visit QR to show the shop-owner-led check-in workflow.
9. Collect visits or issue manual stamps until the configured visit goal is met.
10. Create the reward ticket from the customer QR stamp card.
11. Open `/app/claim/[claimId]` and show the reward ticket QR, reward ticket sheet, counter backup code, full-address wallet hover title, and shop owner wallet validation guidance.
12. Switch back to the shop owner wallet, validate the reward ticket, refresh the claim page, confirm the used state appears, and confirm a second validation attempt is rejected.
13. End on the `/app` dashboard with the customer QR stamp card, merchant QR stamp card manager, and reward tickets visible.
