# Pitch Outline

## Slide 1
- noodl3
- Celo-native merchant QR stamp card loyalty app for real-world visits

## Slide 2
- Problem
- Small merchants still use paper cards because digital loyalty is too heavy
- Existing apps often force catalogs, checkout, integrations, or custodial point systems

## Slide 3
- Product
- A merchant wallet creates a merchant QR stamp card with a reward promise and visit goal
- Customers scan a visit QR and collect one Stamp / Selo per visit
- Reward tickets unlock when the configured visit goal is reached
- The shop owner validates each reward ticket once from the shop owner wallet

## Slide 4
- Why Celo + MiniPay
- Mobile-first wallet context
- Low-cost onchain state changes
- Portable customer progress
- No backend points database is required

## Slide 5
- Onchain design
- Programs are self-created by merchant wallets
- Stamps are non-transferable contract state
- Printed visit QR allows one stamp per wallet every 20 hours
- Live visit QR uses five-minute, one-use check-in payloads signed by the shop owner
- Rewards use reward tickets that are validated once

## Slide 6
- Demo loop
- Switch languages once to show Portuguese and English app copy
- Create merchant QR stamp card with a square public HTTPS logo URL, reward promise, and visit goal
- Show printed visit QR actions: open link, copy link, share fallback, SVG download, and print the visit QR counter sheet
- Customer collects one visit stamp and sees the 20-hour reuse block
- Generate a five-minute live visit QR
- Customer collects one visit stamp from the live QR instantly
- Customer creates a reward ticket and sees the reward ticket QR, printable reward ticket sheet, and counter backup code
- The shop owner validates each reward ticket once from the shop owner wallet

## Slide 7
- MVP boundaries
- No catalog, menu, cart, or item checkout
- One stamp per visit
- Owner-only management
- Direct onchain indexes without an event-indexing dependency
- No NFT or points-token layer in V1

## Slide 8
- Next steps
- Run real merchant pilots
- Gather merchant feedback on printed visit QR counter sheets and printable reward ticket sheets
- Add analytics and repeat-rate reporting
- Evaluate optional owner delegation after V1
