import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Hex } from "viem";
import { ProgramPage } from "../../../../components/program-page";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";
import { parseProgramId } from "../../../../lib/program";

export const metadata: Metadata = {
  title: "Merchant QR stamp card",
  description: "Collect visit stamps from printed or live visit QR links, track progress, and create reward tickets from a noodl3 QR stamp card."
};

type ProgramRouteProps = {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{
    visit?: string;
    nonce?: string;
    expires?: string;
    sig?: string;
  }>;
};

export default async function Page({ params, searchParams }: ProgramRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const programId = parseProgramId(resolvedParams.programId);

  if (!programId) {
    notFound();
  }

  const expiresAt = resolvedSearchParams.expires
    ? parseProgramId(resolvedSearchParams.expires)
    : null;

  return (
    <ProgramPage
      programId={programId}
      visitMode={resolvedSearchParams.visit}
      nonce={resolvedSearchParams.nonce as Hex | undefined}
      expiresAt={expiresAt}
      signature={resolvedSearchParams.sig as Hex | undefined}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
