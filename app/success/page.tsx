import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Success",
  description: "Redirect to the noodl3 dashboard after legacy success links."
};

export default function Page() {
  redirect("/app");
}
