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
- Customers scan a visit QR and collect one visit stamp (or Selo) per visit
- Customers unlock reward tickets after reaching the configured visit goal
- The shop owner completes one-time reward ticket validation with the shop owner wallet and sees the used state

## Slide 4
- Why Celo + MiniPay
- Mobile-first wallet context for QR-based visits
- Low-cost on-chain visit and reward updates
- Portable wallet-based customer progress
- No separate backend points database is needed

## Slide 5
- On-chain design
- Merchant wallets create QR stamp card programs themselves
- Visit stamps are non-transferable contract state
- The printed visit QR allows one visit stamp per wallet every 20 hours
- The live visit QR uses five-minute, one-use check-in payloads signed by the shop owner wallet
- Shop owners can issue manual fallback stamps to customer wallets
- Each reward is issued as a reward ticket that can be validated only once

## Slide 6
- Demo loop
- Switch languages once to show Brazilian Portuguese and English app copy
- Create a merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal
- Show printed visit QR actions: open the link, copy the link, use the share fallback, download the SVG, and print the visit QR counter sheet
- Customer collects one visit stamp and sees the 20-hour reuse cooldown
- Generate a five-minute live visit QR on localhost for desktop demos or over HTTPS for phone scans
- Customer collects one visit stamp from the live QR immediately
- Issue a manual fallback stamp to show the shop-owner-approved path
- Customer creates a reward ticket and sees the reward ticket QR, reward ticket sheet, and counter backup code
- The shop owner completes one-time reward ticket validation with the shop owner wallet and confirms the used state

## Slide 7
- MVP boundaries
- No catalog, menu, cart, item checkout, or payment flow in the V1 loyalty loop
- One visit stamp per visit
- Management stays limited to shop owner wallets
- Direct on-chain indexes without an event-indexing dependency
- No NFT or points token layer in V1

## Slide 8
- Next steps
- Run real merchant pilots in counter workflows
- Gather merchant feedback on printed visit QR counter sheet placement and reward ticket sheet handoff
- Validate phone QR scans over HTTPS and printed QR flows before each merchant demo
- Add analytics and repeat-rate reporting
- Evaluate optional shop owner delegation after V1
