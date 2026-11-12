import clsx from "clsx";
import { statusLabel, type CampaignStatus } from "@/lib/schemas";

const tone: Record<CampaignStatus, string> = {
  draft: "border border-line bg-panel text-muted",
  in_progress: "bg-accent-soft text-accent",
  in_review: "bg-warn-soft text-warn",
  approved: "bg-ok-soft text-ok",
  completed: "bg-ink text-inv",
};

export function StatusPill({ status }: { status: CampaignStatus }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tone[status])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}
