import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy store redirect",
  description: "Redirect legacy store links to the noodl3 QR stamp card dashboard."
};

export default function Page() {
  redirect("/app");
}
