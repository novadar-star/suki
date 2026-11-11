export type ClaimKind = "product_fact" | "marketing_claim";

export type Claim = {
  text: string;
  kind: ClaimKind;
  source: string;
};

export type Brand = {
  id: string;
  name: string;
  description: string;
  industry: string;
  targetMarket: string;
  positioning: string;
  tone: string;
  sourceUrl: string;
  checkedOn: string;
  product: {
    name: string;
    description: string;
    size: string;
    price: string;
    keyIngredients: string[];
    usage: string[];
    image: string;
  };
  claims: Claim[];
  guidelines: {
    isSample: boolean;
    prohibitedClaims: string[];
    avoidWords: string[];
    disclaimers: string[];
    restrictions: string[];
  };
};

export type PastHook = {
  hook: string;
  angle: string;
  format: string;
  date: string;
};

export type Account = {
  id: string;
  name: string;
  handle: string;
  platform: "Instagram" | "TikTok";
  color: string;
  audience: string;
  painPoints: string[];
  interests: string[];
  editorialIdentity: string;
  voice: string;
  pillars: string[];
  formats: string[];
  visualDirection: string;
  restrictions: string[];
  history: PastHook[];
};

export type EvidenceType = "feed_observation" | "platform_page" | "article" | "other";

export type Evidence = {
  id: string;
  type: EvidenceType;
  note: string;
  url?: string;
  observedOn: string;
  addedBy: string;
};

export type TrendAnalysis = {
  origin: "curated" | "ai" | "demo";
  hookPattern: string;
  narrative: string;
  format: string;
  visualDirection: string;
  editingStyle: string;
  emotionalTrigger: string;
  productIntegration: string;
  adaptationPotential: string;
};

export type Trend = {
  id: string;
  title: string;
  platform: "Instagram" | "TikTok" | "Any";
  kind: "reference_format" | "submitted";
  description: string;
  sourceUrl?: string;
  addedOn: string;
  addedBy: string;
  tags: string[];
  evidence: Evidence[];
  analysis: TrendAnalysis;
};

export type Confidence = "reference" | "observed" | "supported";
