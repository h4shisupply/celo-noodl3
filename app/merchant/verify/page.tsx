import { redirect } from "next/navigation";
import { buildDashboardUrl } from "../../../lib/dashboard-route";

type VerifyRouteProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function Page({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = await searchParams;

  redirect(
    buildDashboardUrl({
      role: "merchant",
      scanner: "claim",
      claim: resolvedSearchParams.claim
    })
  );
}
