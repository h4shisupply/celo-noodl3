import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy reward ticket verification redirect",
  description: "Redirect legacy reward ticket verification links to the matching noodl3 reward ticket QR page."
};

type VerifyRouteProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function Page({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = await searchParams;
  redirect(resolvedSearchParams.claim ? `/app/claim/${resolvedSearchParams.claim}` : "/app");
}
