import type { Metadata } from "next";
import { DashboardPage } from "../../components/dashboard-page";
import { getDefaultChainId } from "../../lib/chains";
import { publicEnv } from "../../lib/env";

export const metadata: Metadata = {
  title: "Customer and merchant dashboard",
  description: "Open the noodl3 dashboard with customer and merchant QR stamp cards, visit stamps, manual fallback stamps, and reward tickets."
};

export default function Page() {
  return (
    <DashboardPage
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
