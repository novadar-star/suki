import { confidenceHelp, confidenceLabel } from "@/lib/confidence";
import type { Confidence } from "@/lib/types";
import { Tag } from "./ui";

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span title={confidenceHelp[level]}>
      <Tag tone={level === "reference" ? "plain" : level === "observed" ? "accent" : "ink"}>{confidenceLabel[level]}</Tag>
    </span>
  );
}
