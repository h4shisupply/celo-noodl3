# Launch Checklist

- Deploy `Noodl3Loyalty.sol` on the target Celo network.
- Verify the contract on the explorer.
- Set `NEXT_PUBLIC_NOODL3_CONTRACT_ADDRESS_*` and deployment block env vars.
- Set `NOODL3_CONTRACT_ADDRESS_*` for script-based verify and seed flows.
- Seed the configured stores on the deployed network.
- Confirm each store resolves correctly from the catalog or `NOODL3_STORE_CATALOG_JSON`.
- Test the purchase flow inside MiniPay on a real phone.
- Confirm the QR-entry purchase flow works from another device or printed QR.
- Confirm reward redemption burns stamps and opens `/app/claim/[claimId]`.
- Confirm the merchant dashboard loads customers for the configured store manager wallet.
- Confirm the merchant verifier can scan and consume a claim.
- Capture final screenshots for:
  - landing page
  - store checkout page
  - rewards page
  - claim QR page
  - verifier page
- Record a short demo.
