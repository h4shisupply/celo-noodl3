import type { Metadata } from "next";
import { DashboardPage } from "../../components/dashboard-page";
import { getDefaultChainId } from "../../lib/chains";
import { publicEnv } from "../../lib/env";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track stamp cards, owned programs, and reward claims in noodl3."
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
