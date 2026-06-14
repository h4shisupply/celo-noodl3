import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy reward ticket redirect",
  description: "Redirect legacy reward ticket links while preserving the claim ID for the matching noodl3 reward ticket QR page."
};

type ClaimRouteProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: ClaimRouteProps) {
  const resolvedParams = await params;
  redirect(`/app/claim/${resolvedParams.claimId}`);
}
