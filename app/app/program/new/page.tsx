import { ProgramCreatePage } from "../../../../components/program-create-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

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
