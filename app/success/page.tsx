import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy success redirect",
  description: "Redirect legacy success page links to the noodl3 wallet dashboard for customer and merchant QR stamp cards, visit stamps, and reward tickets."
};

export default function Page() {
  redirect("/app");
}
