import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { error: "Merchant catalog editing was removed in the loyalty program pivot." },
    { status: 410 }
  );
}
