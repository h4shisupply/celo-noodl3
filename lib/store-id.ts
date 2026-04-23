import { hexToString, stringToHex, type Hex } from "viem";

export function encodeStoreId(slug: string): Hex {
  return stringToHex(slug, { size: 32 });
}

export function decodeStoreId(storeId: Hex) {
  return hexToString(storeId, { size: 32 }).replace(/\0+$/g, "");
}
