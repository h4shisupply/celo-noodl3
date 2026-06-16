import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy rewards redirect",
  description: "Redirect legacy rewards links into the noodl3 dashboard page for customer and merchant QR stamp cards, visit stamps, and reward ticket history."
};

export default function Page() {
  redirect("/app");
}
