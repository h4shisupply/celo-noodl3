import type { Metadata } from "next";
import { ClaimPage } from "../../../../components/claim-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

export const metadata: Metadata = {
  title: "Reward ticket QR",
  description: "Show the Celo-native reward ticket QR, printable reward ticket sheet, counter backup code, and shop owner wallet validation guidance."
};

type ClaimRouteProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: ClaimRouteProps) {
  const resolvedParams = await params;

  return (
    <ClaimPage
      appUrl={publicEnv.appUrl}
      claimId={resolvedParams.claimId}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
