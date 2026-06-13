import type { Metadata } from "next";
import { ProgramCreatePage } from "../../../../components/program-create-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

export const metadata: Metadata = {
  title: "Create merchant QR stamp card",
  description: "Create a noodl3 merchant QR stamp card with an HTTPS shop icon, reward promise, and visit goal."
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
