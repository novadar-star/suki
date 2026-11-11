import clsx from "clsx";
import { statusLabel, type CampaignStatus } from "@/lib/schemas";

const tone: Record<CampaignStatus, string> = {
  draft: "border border-line bg-panel text-muted",
  in_progress: "bg-[#e8eefc] text-[#2448b8]",
  in_review: "bg-[#fdf1dc] text-[#8a5a00]",
  approved: "bg-[#e1f4ec] text-[#11704f]",
  completed: "bg-ink text-white",
};

export function StatusPill({ status }: { status: CampaignStatus }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tone[status])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}
