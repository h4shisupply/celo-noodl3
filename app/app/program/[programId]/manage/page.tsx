import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramManagePage } from "../../../../../components/program-manage-page";
import { getDefaultChainId } from "../../../../../lib/chains";
import { publicEnv } from "../../../../../lib/env";
import { parseProgramId } from "../../../../../lib/program";

export const metadata: Metadata = {
  title: "Manage stamp card"
};

type ManageRouteProps = {
  params: Promise<{ programId: string }>;
};

export default async function Page({ params }: ManageRouteProps) {
  const resolvedParams = await params;
  const programId = parseProgramId(resolvedParams.programId);

  if (!programId) {
    notFound();
  }

  return (
    <ProgramManagePage
      appUrl={publicEnv.appUrl}
      programId={programId}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
