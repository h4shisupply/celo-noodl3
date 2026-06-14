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
- A merchant wallet creates a merchant QR stamp card with a reward promise and customer visit goal
- Customers scan a visit QR and collect one Stamp / Selo per visit
- Reward tickets unlock when the configured customer visit goal is reached
- Owner validates each reward ticket once from the owner wallet

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
- Live visit QR uses owner-signed, five-minute, one-use check-in payloads
- Rewards use one-time reward tickets

## Slide 6
- Demo loop
- Create merchant QR stamp card with an HTTPS logo URL, reward promise, and customer visit goal
- Show printed visit QR actions: open link, copy link, share fallback, SVG download, and print the visit QR counter sheet
- Customer collects one visit stamp and sees the 20-hour reuse block
- Generate a five-minute live visit QR
- Customer collects one visit stamp from the live QR instantly
- Customer creates a reward ticket and sees the reward ticket QR, reward ticket sheet, and counter backup code
- Owner validates each reward ticket once from the owner wallet

## Slide 7
- MVP boundaries
- No catalog or item checkout
- One stamp per visit
- Owner-only management
- Direct onchain indexes for dashboard reads
- No NFT layer in V1

## Slide 8
- Next steps
- Real merchant pilots
- Merchant feedback on printed visit QR counter sheets and reward ticket sheets
- Analytics and repeat-rate reporting
- Optional owner delegation after V1
