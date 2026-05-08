import { redirect } from "next/navigation";

type VerifyRouteProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function Page({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = await searchParams;
  redirect(resolvedSearchParams.claim ? `/app/claim/${resolvedSearchParams.claim}` : "/app");
}
