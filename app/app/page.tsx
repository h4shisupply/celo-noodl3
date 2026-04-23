import { DashboardPage } from "../../components/dashboard-page";
import { getResolvedStoreCatalog } from "../../lib/catalog-server";
import { getDefaultChainId } from "../../lib/chains";
import { publicEnv } from "../../lib/env";

export default function Page() {
  return (
    <DashboardPage
      stores={getResolvedStoreCatalog()}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
