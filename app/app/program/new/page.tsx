import type { Metadata } from "next";
import { ProgramCreatePage } from "../../../../components/program-create-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

export const metadata: Metadata = {
  title: "Create merchant QR stamp card",
  description: "Create a Celo-native merchant QR stamp card with a square, public HTTPS logo URL, a reward promise, and a visit goal."
};

export default function Page() {
  return (
    <ProgramCreatePage
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
