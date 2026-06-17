import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy store redirect",
  description: "Redirect legacy store links to the noodl3 customer and merchant dashboard for QR stamp cards, visit stamps, and reward tickets."
};

export default function Page() {
  redirect("/app");
}
