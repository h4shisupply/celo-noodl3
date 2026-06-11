import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Redirect to the noodl3 dashboard for reward claims and QR stamp cards."
};

export default function Page() {
  redirect("/app");
}
