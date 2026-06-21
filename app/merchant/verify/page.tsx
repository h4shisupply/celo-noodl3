import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy merchant reward verification redirect",
  description: "Redirect legacy merchant reward verification links with a claim query to the matching Celo-native reward ticket QR page, and links without one to the noodl3 dashboard."
};

type VerifyRouteProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function Page({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = await searchParams;
  redirect(resolvedSearchParams.claim ? `/app/claim/${resolvedSearchParams.claim}` : "/app");
}
