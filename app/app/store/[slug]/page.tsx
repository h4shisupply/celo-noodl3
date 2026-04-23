import { notFound } from "next/navigation";
import { StorePage } from "../../../../components/store-page";
import { getResolvedStoreBySlug } from "../../../../lib/catalog-server";
import { getDefaultChainId } from "../../../../lib/chains";
import { publicEnv } from "../../../../lib/env";

type StoreRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ item?: string; via?: string }>;
};

export default async function Page({ params, searchParams }: StoreRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const store = getResolvedStoreBySlug(resolvedParams.slug);

  if (!store) {
    notFound();
  }

  return (
    <StorePage
      store={store}
      initialItemId={resolvedSearchParams.item}
      openedFromQr={resolvedSearchParams.via === "qr"}
      initialChainId={getDefaultChainId()}
      contractAddresses={{
        celo: publicEnv.contractAddressMainnet || null,
        celoSepolia: publicEnv.contractAddressSepolia || null
      }}
    />
  );
}
