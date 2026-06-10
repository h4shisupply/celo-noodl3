import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reward claim",
  description: "Redirect legacy reward claim links to the matching noodl3 claim page."
};

type ClaimRouteProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: ClaimRouteProps) {
  const resolvedParams = await params;
  redirect(`/app/claim/${resolvedParams.claimId}`);
}
