import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Store",
  description: "Redirect legacy store links to the noodl3 QR stamp card dashboard."
};

export default function Page() {
  redirect("/app");
}
