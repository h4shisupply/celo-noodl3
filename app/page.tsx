import { HomePage } from "../components/home-page";
import { getResolvedStoreCatalog } from "../lib/catalog-server";

export default function Page() {
  return <HomePage stores={getResolvedStoreCatalog()} />;
}
