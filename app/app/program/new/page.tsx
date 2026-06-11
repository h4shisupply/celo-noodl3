import type { Metadata } from "next";
import { ProgramCreatePage } from "../../../../components/program-create-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

export const metadata: Metadata = {
  title: "Create QR stamp card",
  description: "Create a noodl3 QR stamp card with a shop icon, visit goal, and reward."
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
