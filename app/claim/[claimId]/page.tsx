import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy reward ticket redirect",
  description: "Redirect legacy reward ticket links to the matching Celo-native reward ticket QR page and preserve the claim ID."
};

type ClaimRouteProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: ClaimRouteProps) {
  const resolvedParams = await params;
  redirect(`/app/claim/${resolvedParams.claimId}`);
}
