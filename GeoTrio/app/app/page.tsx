import RouteExplorer from "@/components/RouteExplorer";
import { requireCurrentSessionId } from "@/lib/server-session";

export default async function Home() {
  await requireCurrentSessionId();

  return <RouteExplorer />;
}
