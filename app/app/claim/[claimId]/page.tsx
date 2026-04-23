import { ClaimPage } from "../../../../components/claim-page";
import { getResolvedStoreCatalog } from "../../../../lib/catalog-server";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

type ClaimRouteProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: ClaimRouteProps) {
  const resolvedParams = await params;

  return (
    <ClaimPage
      appUrl={publicEnv.appUrl}
      stores={getResolvedStoreCatalog()}
      claimId={resolvedParams.claimId}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
