import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legacy success redirect",
  description: "Redirect legacy success page links to the noodl3 dashboard instead of exposing old checkout surfaces."
};

export default function Page() {
  redirect("/app");
}
