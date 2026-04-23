import { NextResponse } from "next/server";
import { getAddress, verifyMessage, type Hex } from "viem";
import { getResolvedStoreCatalog } from "../../../../lib/catalog-server";
import { getContractAddress, getDefaultChainId } from "../../../../lib/chains";
import {
  applyMerchantCatalogPatch,
  applyOwnerMirrorPatch,
  assertMerchantPatchFresh,
  buildMerchantPatchMessage,
  serializeStoreCatalogForEnv,
  type MerchantCatalogPatchPayload,
  type MerchantOwnerMirrorPatchPayload,
  type MerchantPatchRequest
} from "../../../../lib/merchant-catalog";
import { fetchContractOwnerServer } from "../../../../lib/server-contract";
import { syncCatalogEnvAndRedeploy } from "../../../../lib/vercel-admin";

function buildPayloadForSignature(body: MerchantPatchRequest) {
  if (body.kind === "catalog") {
    const payload: MerchantCatalogPatchPayload = {
      kind: "catalog",
      storeSlug: body.storeSlug,
      submittedAt: body.submittedAt,
      store: body.store,
      menu: body.menu
    };

    return payload;
  }

  const payload: MerchantOwnerMirrorPatchPayload = {
    kind: "owner-mirror",
    storeSlug: body.storeSlug,
    submittedAt: body.submittedAt,
    loyalty: body.loyalty,
    onchain: body.onchain
  };

  return payload;
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as MerchantPatchRequest;
    const signer = getAddress(body.signer) as Hex;
    const expectedMessage = buildMerchantPatchMessage(buildPayloadForSignature(body));

    if (body.message !== expectedMessage) {
      return NextResponse.json(
        { error: "Signed message does not match the submitted merchant patch." },
        { status: 400 }
      );
    }

    const isValidSignature = await verifyMessage({
      address: signer,
      message: body.message,
      signature: body.signature
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid merchant signature." }, { status: 401 });
    }

    assertMerchantPatchFresh(body.submittedAt);

    const stores = getResolvedStoreCatalog();
    const targetStore = stores.find((store) => store.slug === body.storeSlug);
    if (!targetStore) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const currentManager = targetStore.onchain?.manager
      ? getAddress(targetStore.onchain.manager)
      : null;
    const contractOwner = await fetchContractOwnerServer(
      getDefaultChainId(),
      getContractAddress(getDefaultChainId())
    );
    const isContractOwner =
      contractOwner !== null && signer.toLowerCase() === contractOwner.toLowerCase();
    const isCurrentManager =
      currentManager !== null && signer.toLowerCase() === currentManager.toLowerCase();

    if (body.kind === "owner-mirror" && !isContractOwner) {
      return NextResponse.json(
        { error: "Only the contract owner can update onchain settings." },
        { status: 403 }
      );
    }

    if (body.kind === "catalog" && !isContractOwner && !isCurrentManager) {
      return NextResponse.json(
        { error: "Only the current store manager or contract owner can update this store." },
        { status: 403 }
      );
    }

    const nextStores =
      body.kind === "catalog"
        ? applyMerchantCatalogPatch(
            stores,
            buildPayloadForSignature(body) as MerchantCatalogPatchPayload
          )
        : applyOwnerMirrorPatch(
            stores,
            buildPayloadForSignature(body) as MerchantOwnerMirrorPatchPayload
          );
    const rawCatalogJson = serializeStoreCatalogForEnv(nextStores);
    const deployment = await syncCatalogEnvAndRedeploy(rawCatalogJson);

    return NextResponse.json({
      stores: nextStores,
      deployment: {
        id: deployment?.id ?? null,
        url: deployment?.url ?? null
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not save the merchant catalog."
      },
      { status: 500 }
    );
  }
}
