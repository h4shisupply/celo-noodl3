import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy rewards redirect",
  description: "Redirect legacy rewards links to the noodl3 dashboard for reward ticket history, customer QR stamp cards, and visit stamps."
};

export default function Page() {
  redirect("/app");
}
