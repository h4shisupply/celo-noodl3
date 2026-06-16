import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy rewards redirect",
  description: "Redirect legacy rewards links into the noodl3 dashboard page for reward ticket history, customer and merchant QR stamp cards, and visit stamps."
};

export default function Page() {
  redirect("/app");
}
