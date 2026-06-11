import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Success",
  description: "Redirect legacy success links to the noodl3 QR stamp card dashboard."
};

export default function Page() {
  redirect("/app");
}
