# Pitch Outline

## Slide 1
- noodl3
- Web3 loyalty stamp cards for real-world visits

## Slide 2
- Problem
- Small merchants still use paper cards because digital loyalty is too heavy
- Existing apps often force catalogs, checkout, integrations, or custodial point systems

## Slide 3
- Product
- Any wallet creates a loyalty program
- Customers scan a QR and collect one Stamp / Selo per visit
- Rewards unlock after the configured visit count
- Owner validates a one-time reward claim

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
- Static QR allows one stamp per wallet every 20 hours
- Dynamic QR is owner-signed, expiring, and one-use
- Rewards become one-time claims

## Slide 6
- Demo loop
- Create program
- Show fixed QR
- Customer collects a daily static stamp
- Generate dynamic QR
- Customer collects instantly
- Customer claims reward
- Owner consumes claim

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
