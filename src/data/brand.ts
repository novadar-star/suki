import type { Brand } from "@/lib/types";

const PAGE = "https://lustminerals.com.au/products/hyaluronic-acid-serum";

// Claim IDs: F = product fact, C = marketing claim. Rule IDs for guidelines are
// derived by position: P-01 prohibited claims, W-01 avoid words, D-01 disclaimers.
export const brand: Brand = {
  id: "lust-minerals",
  name: "Lust Minerals",
  description:
    "Australian brand making mineral makeup, skincare and body care. Vegan and cruelty-free.",
  industry: "Beauty and skincare",
  targetMarket: "People who want a simple daily skincare routine",
  positioning: "Clean beauty with a science-led formula",
  tone: "Warm, clear and confident. Never pushy.",
  sourceUrl: PAGE,
  checkedOn: "2026-11-11",
  product: {
    name: "4D Hyaluronic Acid Serum",
    description:
      "A lightweight, fast-absorbing hydrating serum. Applied to damp skin before moisturiser.",
    size: "30 ml",
    price: "AUD 58",
    keyIngredients: ["Hyaluronic acid", "Vitamin B5 (panthenol)", "Red seaweed extract", "Radish root ferment"],
    usage: [
      "Use morning and night.",
      "Apply to damp skin right after cleansing.",
      "Layer other serums after it.",
      "Finish with moisturiser.",
    ],
    image: "/product/serum.svg",
  },
  claims: [
    { id: "F-01", text: "30 ml bottle", kind: "product_fact", source: PAGE },
    { id: "F-02", text: "Contains hyaluronic acid, vitamin B5, red seaweed extract and radish root ferment", kind: "product_fact", source: PAGE },
    { id: "F-03", text: "Apply to damp skin, then follow with moisturiser", kind: "product_fact", source: PAGE },
    { id: "F-04", text: "Gentle enough for daily use, morning and night", kind: "product_fact", source: PAGE },
    { id: "F-05", text: "Australian-made, vegan and cruelty-free", kind: "product_fact", source: PAGE },
    { id: "C-01", text: "Lightweight, fast-absorbing formula", kind: "marketing_claim", source: PAGE },
    { id: "C-02", text: "Multi-layer hydration for plump, smooth, radiant skin", kind: "marketing_claim", source: PAGE },
    { id: "C-03", text: "Helps instantly plump and smooth the appearance of dehydrated skin", kind: "marketing_claim", source: PAGE },
    { id: "C-04", text: "Instant hydration and visible glow", kind: "marketing_claim", source: PAGE },
  ],
  guidelines: {
    isSample: true,
    prohibitedClaims: [
      "Clinically proven",
      "Reduces wrinkles or fine lines",
      "Boosts collagen",
      "Treats or cures acne",
      "Results in a set number of days",
      "Dermatologist recommended",
    ],
    avoidWords: ["miracle", "cure", "guaranteed", "best on the market", "flawless"],
    disclaimers: ["Patch test before first use."],
    restrictions: [
      "No made-up testimonials or reviews.",
      "No before-and-after claims.",
      "No mentions of competitor brands.",
      "Label AI-generated video as synthetic.",
    ],
  },
};
