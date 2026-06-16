import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy merchant reward verification redirect",
  description: "Redirect legacy merchant reward verification links to the matching Celo-native reward ticket QR page when a claim query parameter is present, or to the dashboard otherwise."
};

type VerifyRouteProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function Page({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = await searchParams;
  redirect(resolvedSearchParams.claim ? `/app/claim/${resolvedSearchParams.claim}` : "/app");
}
