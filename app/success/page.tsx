import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy success redirect",
  description: "Redirect legacy success links to the noodl3 dashboard for QR stamp cards, visit stamps, and reward ticket history."
};

export default function Page() {
  redirect("/app");
}
