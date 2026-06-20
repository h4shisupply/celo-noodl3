# Pitch Outline

## Slide 1
- noodl3
- Celo-native merchant QR stamp card loyalty app for real-world visits

## Slide 2
- Problem
- Small merchants still use paper stamp cards because digital loyalty tools are too heavy for counter workflows
- Existing apps often force catalogs, checkout flows, integrations, or custodial point systems

## Slide 3
- Product
- A merchant wallet creates a merchant QR stamp card with a reward promise and a visit goal
- Customers scan a visit QR and collect one Stamp (or Selo) per visit
- Customers unlock reward tickets after reaching the configured visit goal
- The shop owner validates each reward ticket once with the shop owner wallet

## Slide 4
- Why Celo + MiniPay
- Mobile-first wallet context
- Low-cost on-chain state changes
- Portable customer progress
- No backend points database is needed

## Slide 5
- On-chain design
- Merchant wallets create programs themselves
- Stamps are non-transferable contract state
- The printed visit QR allows one stamp per wallet every 20 hours
- The live visit QR uses five-minute, one-use check-in payloads signed by the shop owner
- Rewards are issued as reward tickets that are validated only once

## Slide 6
- Demo loop
- Switch languages once to show Portuguese and English app copy
- Create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal
- Show printed visit QR actions: open the link, copy the link, use the share fallback, download the SVG, and print the visit QR counter sheet
- Customer collects one visit stamp and sees the 20-hour reuse cooldown
- Generate a five-minute live visit QR
- Customer collects one visit stamp from the live QR immediately
- Customer creates a reward ticket and sees the reward ticket QR, reward ticket sheet, and counter backup code
- The shop owner validates each reward ticket once with the shop owner wallet

## Slide 7
- MVP boundaries
- No catalog, menu, cart, or item checkout
- One stamp per visit
- Owner-only management
- Direct on-chain indexes without an event-indexing dependency
- No NFT or points token layer in V1

## Slide 8
- Next steps
- Run real merchant pilots
- Gather merchant feedback on visit QR counter sheets and reward ticket sheets
- Add analytics and repeat-rate reporting
- Evaluate optional owner delegation after V1
