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
- Any wallet creates a QR stamp card
- Customers scan a visit QR and collect one Stamp / Selo per visit
- Rewards unlock after the configured visit count
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
- Dynamic visit QR is owner-signed, expiring, and one-use
- Rewards become one-time claims

## Slide 6
- Demo loop
- Create QR stamp card
- Show fixed visit QR
- Customer collects a daily static stamp
- Generate dynamic visit QR
- Customer collects instantly
- Customer creates reward claim
- Owner validates reward claim once

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
- Printable QR kits
- Analytics and repeat-rate reporting
- Optional owner delegation after V1
