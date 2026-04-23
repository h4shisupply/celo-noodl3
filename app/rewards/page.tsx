import { redirect } from "next/navigation";
import { buildDashboardUrl } from "../../lib/dashboard-route";

export default function Page() {
  redirect(buildDashboardUrl({ role: "customer", tab: "rewards" }));
}
