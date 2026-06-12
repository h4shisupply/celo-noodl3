# Demo Script

Use separate owner and customer wallets, or separate browser profiles, so wallet-gated states are clear during the demo.

1. Open the home page and explain the product in one sentence: Celo-native QR stamp-card loyalty for real-world visits.
2. Switch the language once, refresh, and confirm the landing page, header, and app entry copy stay in sync.
3. Open `/app`, connect a wallet, optionally add a profile name, and create a QR stamp card with an HTTPS icon URL, reward promise, and visit goal.
4. Open the manager view and show the fixed visit QR actions: open link, copy link, share fallback, SVG download, and print sheet.
5. Open the fixed visit QR as a customer, collect one static stamp, and confirm immediate reuse is blocked by the 20-hour cooldown.
6. Generate a dynamic visit QR on an HTTPS or localhost demo URL, point out the five-minute countdown, scan it as a customer, and collect one dynamic stamp instantly.
7. Call out the scanner camera-state message before the scan and the success feedback after the stamp lands.
8. Regenerate the dynamic visit QR to show the owner-led check-in workflow.
9. Issue enough stamps to reach the reward threshold.
10. Create the reward ticket from the customer QR stamp card.
11. Open `/app/claim/[claimId]`, show the reward ticket QR, counter backup code, and owner-wallet validation hint.
12. Switch back to the owner wallet, validate the reward ticket, and confirm that a second validation fails.
13. End on the dashboard showing the customer QR stamp card, program manager, and reward ticket history.
