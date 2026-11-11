import { notFound } from "next/navigation";
import { getCampaign, getTrends } from "@/lib/repo";
import { confidenceOf } from "@/lib/confidence";
import { Workspace, type StageId } from "@/components/workspace/workspace";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const [{ id }, { stage }] = await Promise.all([params, searchParams]);
  const [campaign, trends] = await Promise.all([getCampaign(id), getTrends()]);
  if (!campaign) notFound();
  return (
    <Workspace
      initial={campaign}
      trends={trends.map((t) => ({ ...t, confidence: confidenceOf(t) }))}
      stage={(stage as StageId) ?? "brief"}
    />
  );
}
