# Pitch Outline

## Slide 1
- noodl3
- Celo-native QR stamp-card loyalty for real-world visits

## Slide 2
- Problem
- Small merchants still use paper cards because digital loyalty is too heavy
- Existing apps often force catalogs, checkout, integrations, or custodial point systems

## Slide 3
- Product
- Any wallet creates a QR stamp card with a reward promise
- Customers scan a visit QR and collect one Stamp / Selo per visit
- Reward tickets unlock after the configured visit goal
- Owner validates a one-time reward ticket

## Slide 4
- Why Celo + MiniPay
- Mobile-first wallet context
- Cheap onchain state changes
- Portable customer progress
- No backend points database required

## Slide 5
- Onchain design
- Programs are self-created by wallets
- Stamps are non-transferable contract state
- Static visit QR allows one stamp per wallet every 20 hours
- Dynamic visit QR uses owner-signed, five-minute, one-use check-in payloads
- Rewards use one-time reward tickets

## Slide 6
- Demo loop
- Create QR stamp card with a reward promise and visit goal
- Show fixed visit QR open, copy, share fallback, download, and print actions
- Customer collects one static stamp and sees the 20-hour reuse block
- Generate five-minute dynamic visit QR
- Customer collects one dynamic stamp instantly
- Customer creates reward ticket
- Owner validates each reward ticket once

## Slide 7
- MVP boundaries
- No catalog or item checkout
- One stamp per visit
- Owner-only management
- Direct onchain indexes
- No NFT layer

## Slide 8
- Next steps
- Real merchant pilots
- Printable fixed visit QR kits
- Analytics and repeat-rate reporting
- Optional owner delegation after V1
