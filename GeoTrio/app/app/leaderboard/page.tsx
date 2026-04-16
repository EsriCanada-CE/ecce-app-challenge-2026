import { getLeaderboardPageData } from "@/lib/db/queries";
import { requireCurrentSessionId } from "@/lib/server-session";
import LeaderboardView from "@/components/LeaderboardView";

export const metadata = {
  title: "Stride — Leaderboard",
};

export default async function LeaderboardPage() {
  const sessionId = await requireCurrentSessionId();
  const data = await getLeaderboardPageData(sessionId);

  return <LeaderboardView data={data} />;
}
