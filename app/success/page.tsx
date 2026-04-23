import { SuccessPage } from "../../components/success-page";
import { getResolvedStoreCatalog } from "../../lib/catalog-server";
import { getDefaultChainId } from "../../lib/chains";

type SuccessRouteProps = {
  searchParams: Promise<{
    mode?: string;
    tx?: string;
    store?: string;
    item?: string;
    claim?: string;
  }>;
};

export default async function Page({ searchParams }: SuccessRouteProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <SuccessPage
      chainId={getDefaultChainId()}
      stores={getResolvedStoreCatalog()}
      mode={resolvedSearchParams.mode}
      txHash={resolvedSearchParams.tx}
      storeSlug={resolvedSearchParams.store}
      itemId={resolvedSearchParams.item}
      claimId={resolvedSearchParams.claim}
    />
  );
}
