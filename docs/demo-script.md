# Demo Script

Use separate owner and customer wallets or separate browser profiles so wallet-gated states stay clear during the demo.

1. Open the home page and explain the product in one sentence: Celo-native merchant QR stamp card loyalty app for real-world visits.
2. Switch languages once, refresh, and confirm the landing page, header, and app entry copy stay in sync.
3. Open `/app`, connect a wallet, optionally add a display name, and create a merchant QR stamp card with an HTTPS logo URL, reward promise, and customer visit goal.
4. Open the merchant QR stamp card manager and show the printed visit QR actions: open link, copy link, share fallback, SVG download, and print the visit QR counter sheet.
5. Open the printed visit QR as a customer, collect one visit stamp, and confirm immediate reuse is blocked by the 20-hour cooldown.
6. Generate a live visit QR on an HTTPS or localhost demo URL, point out the five-minute countdown, scan it as a customer, and collect one visit stamp instantly.
7. Call out the scanner camera state message before scanning and the success feedback after the stamp is recorded.
8. Regenerate the live visit QR to show the owner-led check-in workflow.
9. Collect or issue enough stamps to reach the customer visit goal.
10. Create the reward ticket from the customer QR stamp card.
11. Open `/app/claim/[claimId]`, show the reward ticket QR, reward ticket sheet, counter backup code, and owner wallet validation hint.
12. Switch back to the owner wallet, validate the reward ticket, and confirm that a second validation fails.
13. End on the `/app` dashboard page showing the customer QR stamp card, merchant QR stamp card manager, and reward ticket history.
