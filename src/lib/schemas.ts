import { z } from "zod";

export const ANGLES = [
  "relatable_problem",
  "discovery",
  "education",
  "routine",
  "value",
  "comparison",
  "demonstration",
] as const;

export const angleLabel: Record<(typeof ANGLES)[number], string> = {
  relatable_problem: "Relatable problem",
  discovery: "Product discovery",
  education: "Education",
  routine: "Routine",
  value: "Value for money",
  comparison: "Comparison",
  demonstration: "Demonstration",
};

export const FORMATS = [
  "GRWM",
  "POV",
  "Listicle",
  "Problem and solution",
  "Product discovery",
  "Tutorial",
  "Day in the life",
  "Comparison",
  "Talking head",
] as const;

export const originSchema = z.enum(["ai", "demo", "edited"]);
export type Origin = z.infer<typeof originSchema>;

// ---------- AI outputs ----------

export const trendAnalysisOut = z.object({
  hookPattern: z.string().min(1),
  narrative: z.string().min(1),
  format: z.string().min(1),
  visualDirection: z.string().min(1),
  editingStyle: z.string().min(1),
  emotionalTrigger: z.string().min(1),
  productIntegration: z.string().min(1),
  adaptationPotential: z.string().min(1),
});

export const playbookOut = z.object({
  trendId: z.string(),
  fitReason: z.string().min(1),
  objective: z.string().min(1),
  audienceInsight: z.string().min(1),
  angle: z.string().min(1),
  hookDirection: z.string().min(1),
  structure: z.array(z.string().min(1)).min(3).max(6),
  format: z.enum(FORMATS),
  visualDirection: z.string().min(1),
  productIntegration: z.string().min(1),
  cta: z.string().min(1),
  safetyNotes: z.array(z.string()).max(4),
  rejectedTrends: z.array(z.object({ trendId: z.string(), reason: z.string() })),
});
export type PlaybookOut = z.infer<typeof playbookOut>;

export const sceneSchema = z.object({
  visual: z.string().min(1),
  voiceover: z.string(),
  onScreen: z.string(),
});
export type Scene = z.infer<typeof sceneSchema>;

export const conceptOut = z.object({
  title: z.string().min(1),
  angleType: z.enum(ANGLES),
  format: z.enum(FORMATS),
  angle: z.string().min(1),
  objective: z.string().min(1),
  differentiation: z.string().min(1),
  hook: z.string().min(1),
  scenes: z.array(sceneSchema).min(4).max(6),
  cta: z.string().min(1),
  claimsUsed: z.array(z.string()),
});
export type ConceptOut = z.infer<typeof conceptOut>;

export const conceptsOut = z.object({ concepts: z.array(conceptOut).length(3) });

// ---------- Stored records ----------

const statusSchema = z.enum(["draft", "approved", "rejected"]);

export const playbookSchema = playbookOut.extend({
  accountId: z.string().max(60),
  status: statusSchema,
  origin: originSchema,
});
export type Playbook = z.infer<typeof playbookSchema>;

export const conceptSchema = conceptOut.extend({
  id: z.string().max(60),
  accountId: z.string().max(60),
  trendId: z.string().max(60),
  status: statusSchema,
  origin: originSchema,
  revisedFor: z.string().max(300).optional(),
});
export type Concept = z.infer<typeof conceptSchema>;

export type Finding = {
  id: string;
  severity: "fix" | "check";
  kind:
    | "same_angle"
    | "same_format"
    | "cross_overlap"
    | "history_repeat"
    | "similar_hooks"
    | "prohibited_claim"
    | "avoid_word"
    | "unsupported_claim"
    | "missing_disclaimer"
    | "paid_late_product"
    | "paid_weak_cta"
    | "organic_hard_sell";
  conceptIds: string[];
  message: string;
  suggestion: string;
  // The rule that fired, e.g. "Brand Brain P-02: prohibited claim".
  rule: string;
  // The line that broke the rule, with the offending words.
  excerpt?: { text: string; matches: string[] };
};

export type QcOverride = { findingId: string; reason: string; by: string; at: string };

export type InsightDimension = "account" | "angle" | "format";
export type Insight = {
  id: string;
  dimension: InsightDimension;
  statement: string;
  nextTest: string;
  groups: { label: string; n: number; mean: number }[];
  sampleSize: number;
  status: "draft" | "accepted" | "dismissed";
  decidedAt?: string;
};

export type Report = {
  createdAt: string;
  conceptCount: number;
  accountCount: number;
  angleCounts: Record<string, number>;
  formatCounts: Record<string, number>;
  findings: Finding[];
};

// ---------- Objective, status, results ----------

export const OBJECTIVE_TYPES = ["organic", "paid"] as const;
export type ObjectiveType = (typeof OBJECTIVE_TYPES)[number];
export const objectiveTypeSchema = z.enum(OBJECTIVE_TYPES);

export const objectiveTypeInfo: Record<ObjectiveType, { label: string; goal: string; rubric: string[] }> = {
  organic: {
    label: "Organic",
    goal: "Attention: views, watch time, saves and shares.",
    rubric: ["Hook earns the first two seconds", "Native to the account, not an ad", "Soft CTA (save, share, comment)"],
  },
  paid: {
    label: "Paid",
    goal: "Conversion: purchases and return on ad spend.",
    rubric: ["Product on screen in the first two scenes", "One clear action in the CTA", "Benefit stated with approved claims only"],
  },
};

export type CampaignStatus = "draft" | "in_progress" | "in_review" | "approved" | "completed";
export const statusLabel: Record<CampaignStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  in_review: "In review",
  approved: "Approved",
  completed: "Completed",
};

export const resultRowSchema = z.object({
  conceptId: z.string().max(60),
  views: z.number().min(0).max(1e9).optional(),
  avgWatchPct: z.number().min(0).max(100).optional(),
  saves: z.number().min(0).max(1e9).optional(),
  shares: z.number().min(0).max(1e9).optional(),
  spend: z.number().min(0).max(1e9).optional(),
  clicks: z.number().min(0).max(1e9).optional(),
  purchases: z.number().min(0).max(1e9).optional(),
  revenue: z.number().min(0).max(1e9).optional(),
});
export type ResultRow = z.infer<typeof resultRowSchema>;

export const resultsIn = z.object({
  source: z.enum(["entered", "sample"]),
  rows: z.array(resultRowSchema).min(1).max(9),
});
export type Results = z.infer<typeof resultsIn> & { enteredAt: string };

export type Campaign = {
  id: string;
  name: string;
  brandId: string;
  objectiveType: ObjectiveType;
  objective: string;
  keyMessage: string;
  targetMarket: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  accountIds: string[];
  trendIds: string[];
  playbooks: Playbook[];
  concepts: Concept[];
  report: Report | null;
  signedOffAt: string | null;
  results: Results | null;
  insights: Insight[];
  qcOverrides: QcOverride[];
  // Set when this campaign is a later round of another one.
  parentId?: string;
  round: number;
  learnings: string[];
};

// ---------- Request bodies ----------

const dateIn = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a date");

export const createCampaignIn = z.object({
  name: z.string().trim().min(1).max(120),
  objectiveType: objectiveTypeSchema,
  objective: z.string().trim().min(1).max(500),
  keyMessage: z.string().trim().max(300).default(""),
  targetMarket: z.string().trim().min(1).max(300),
  deadline: dateIn.default(""),
});

export const updateCampaignIn = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  objectiveType: objectiveTypeSchema.optional(),
  objective: z.string().trim().min(1).max(500).optional(),
  keyMessage: z.string().trim().max(300).optional(),
  targetMarket: z.string().trim().min(1).max(300).optional(),
  deadline: dateIn.optional(),
  accountIds: z.array(z.string().max(60)).max(3).optional(),
  trendIds: z.array(z.string().max(60)).max(3).optional(),
  playbooks: z.array(playbookSchema).max(3).optional(),
  concepts: z.array(conceptSchema).max(9).optional(),
});

export const newTrendIn = z.object({
  title: z.string().trim().min(1).max(120),
  platform: z.enum(["Instagram", "TikTok"]),
  sourceUrl: z
    .string()
    .trim()
    .refine((u) => u === "" || /^https:\/\/(www\.)?(instagram\.com|tiktok\.com|vm\.tiktok\.com)\//.test(u), "Use an Instagram or TikTok link")
    .transform((u) => u || undefined),
  description: z.string().trim().min(40, "Describe the video in at least a few sentences").max(2000),
  observedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const overrideIn = z.object({
  findingId: z.string().max(200),
  reason: z.string().trim().min(5, "Write a short reason").max(300),
});

export const insightDecisionIn = z.object({
  id: z.string().max(200),
  status: z.enum(["draft", "accepted", "dismissed"]),
});

export const evidenceIn = z.object({
  type: z.enum(["feed_observation", "platform_page", "article", "other"]),
  note: z.string().trim().min(3).max(500),
  url: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  observedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
