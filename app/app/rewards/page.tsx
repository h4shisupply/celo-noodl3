import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy rewards redirect",
  description: "Redirect legacy rewards page links to the noodl3 dashboard for customer and merchant QR stamp cards, visit stamps, and reward tickets."
};

export default function Page() {
  redirect("/app");
}
