import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy rewards redirect",
  description: "Redirect legacy rewards links to the noodl3 dashboard where customer QR stamp cards, visit stamps, and reward tickets now live."
};

export default function Page() {
  redirect("/app");
}
