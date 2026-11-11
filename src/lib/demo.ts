import { accounts } from "@/data/accounts";
import type { Account, Trend } from "./types";
import type { ConceptOut, PlaybookOut } from "./schemas";

// Saved sample answers used when no Gemini key is set.
// The "grwm" set is hand-written. It contains 4 planted problems so the
// portfolio check has something real to catch in the demo.

const DISCLAIMER = "Patch test before first use.";
const s = (visual: string, voiceover: string, onScreen: string) => ({ visual, voiceover, onScreen });

const F_INGREDIENTS = "Contains hyaluronic acid, vitamin B5, red seaweed extract and radish root ferment";
const F_DAMP = "Apply to damp skin, then follow with moisturiser";
const F_DAILY = "Gentle enough for daily use, morning and night";
const F_VEGAN = "Australian-made, vegan and cruelty-free";
const M_LIGHT = "Lightweight, fast-absorbing formula";
const M_LAYER = "Multi-layer hydration for plump, smooth, radiant skin";
const M_GLOW = "Instant hydration and visible glow";

const grwmPlaybooks: Record<string, Omit<PlaybookOut, "rejectedTrends">> = {
  "student-finds": {
    trendId: "grwm",
    fitReason: "Student Finds already lives in rushed mornings and dorm life. A GRWM set before an 8 AM class makes skincare feel doable, not fancy.",
    objective: "Show the serum fits a five-minute student morning.",
    audienceInsight: "Students skip skincare because mornings are rushed, not because they don't care.",
    angle: "Skincare that fits a five-minute dorm morning",
    hookDirection: "Open on the clock or the alarm, not the product.",
    structure: ["The rush", "Cleanse at the dorm sink", "Serum on damp skin", "Moisturiser and out the door", "Save for your next early class"],
    format: "GRWM",
    visualDirection: "Dorm mirror, phone propped on the desk, window light",
    productIntegration: "One quick step right after cleansing, on damp skin.",
    cta: "Save this for your next 8 AM.",
    safetyNotes: ["No results claims", "No luxury framing", "Disclaimer on the last scene"],
  },
  "mom-essentials": {
    trendId: "grwm",
    fitReason: "Mom Essentials talks about tiny pockets of time. A quiet GRWM before the house wakes up matches that voice exactly.",
    objective: "Show a real self-care step that survives a busy family morning.",
    audienceInsight: "Busy moms want self-care that takes minutes and doesn't feel indulgent.",
    angle: "The few minutes that are just yours",
    hookDirection: "Open on the quiet house before everyone wakes up.",
    structure: ["The quiet before", "Cleanse", "Serum on damp skin", "Moisturiser as the kids wake", "Your few minutes count"],
    format: "GRWM",
    visualDirection: "Bathroom counter, early light, a little real clutter",
    productIntegration: "Shown as the step that takes seconds between cleanser and moisturiser.",
    cta: "Tell me your two-minute reset.",
    safetyNotes: ["No guilt-based messaging", "No results claims", "Disclaimer on the last scene"],
  },
  "beauty-finds": {
    trendId: "grwm",
    fitReason: "Beauty Finds viewers like to learn why a step is in a routine. An educational GRWM lets the creator explain order and ingredients while getting ready.",
    objective: "Teach where the serum goes in a routine and what is in it.",
    audienceInsight: "Skincare fans are tired of hype and want to understand ingredients and order.",
    angle: "Understand the product before adding it",
    hookDirection: "Open with a question about routine order or the ingredient list.",
    structure: ["The question", "Read the ingredients", "Damp skin application", "Texture close-up", "Where it sits in the routine"],
    format: "GRWM",
    visualDirection: "Vanity setup, macro texture shots, ingredient captions",
    productIntegration: "Explain only the ingredients and steps the brand lists.",
    cta: "Follow for more routine breakdowns.",
    safetyNotes: ["Explain only listed ingredients", "No before-and-after", "Disclaimer on the last scene"],
  },
};

const grwmConcepts: Record<string, ConceptOut[]> = {
  "student-finds": [
    {
      title: "The 8 AM sprint",
      angleType: "relatable_problem",
      format: "POV",
      angle: "Rushed mornings still get one skincare step",
      objective: "Make the routine feel possible on the worst morning",
      differentiation: "A comedic POV about the rush. The other two are calm.",
      hook: "POV: it's 7:58 and your class is at 8",
      scenes: [
        s("Alarm on phone, blanket thrown off", "", "POV: it's 7:58 and your class is at 8"),
        s("Splash at the dorm sink", "Okay. Face wash. Go.", "Step 1: cleanse"),
        s("Serum dropper on damp cheek", "This goes on while my face is still wet.", "Damp skin first"),
        s("Moisturiser, grab bag, door", "Moisturiser. Done. Running.", "Lightweight, fast-absorbing formula"),
        s("Door closes, phone to camera", "Save this for your next 8 AM.", `Save for your next 8 AM. ${DISCLAIMER}`),
      ],
      cta: "Save this for your next 8 AM.",
      claimsUsed: [M_LIGHT, F_DAMP],
    },
    {
      title: "Shelf find",
      angleType: "discovery",
      format: "Product discovery",
      angle: "A small bottle that earns its shelf space",
      objective: "Introduce the product to students for the first time",
      differentiation: "Focuses on the product itself, not the morning.",
      hook: "Found a serum that fits my student routine",
      scenes: [
        s("Tiny dorm shelf, serum in hand", "Found a serum that fits my student routine.", "Found a serum that fits my routine"),
        s("Close-up of the 30 ml bottle", "It's 30 ml, so it actually fits on this shelf.", "30 ml bottle"),
        s("Reading the box", "It's vegan and cruelty-free, which I check now.", "Australian-made, vegan and cruelty-free"),
        s("Applying on damp skin", "Goes on damp skin, then moisturiser.", "Damp skin, then moisturiser"),
        s("Shelf shot with serum in place", "That's the find.", `Would you add it? ${DISCLAIMER}`),
      ],
      cta: "Would you add it to your shelf?",
      claimsUsed: ["30 ml bottle", F_VEGAN, F_DAMP],
    },
    {
      title: "Damp skin is the trick",
      angleType: "education",
      format: "Tutorial",
      angle: "One simple rule most people skip",
      objective: "Teach the right way to apply it",
      differentiation: "A how-to with one clear lesson. No story.",
      hook: "You're probably putting this on dry skin",
      scenes: [
        s("Holding serum at a dry face, then stopping", "You're probably putting this on dry skin.", "Wait"),
        s("Mist or splash water", "The bottle says damp skin. So, damp skin.", "Step 1: wet your face"),
        s("Two drops, press in", "Press it in while it's still wet.", "Step 2: serum on damp skin"),
        s("Moisturiser on top", "Then moisturiser to finish.", "Step 3: moisturiser"),
        s("Thumbs up to camera", "That's it. Morning and night.", `Morning and night. ${DISCLAIMER}`),
      ],
      cta: "Send this to the friend who skips moisturiser.",
      claimsUsed: [F_DAMP, F_DAILY],
    },
  ],
  "mom-essentials": [
    {
      title: "Before the house wakes up",
      angleType: "routine",
      format: "GRWM",
      angle: "A quiet morning routine that takes minutes",
      objective: "Show self-care that fits a family morning",
      differentiation: "Calm and slow. The others are about interruptions and the counter.",
      hook: "Getting ready before anyone else wakes up",
      scenes: [
        s("Dark hallway, closed kids' door", "Getting ready before anyone else wakes up.", "Before the house wakes up"),
        s("Washing face at the sink", "Cleanser first.", "Step 1"),
        s("Serum on damp skin", "Serum while my skin's still damp.", "Serum on damp skin"),
        s("Moisturiser, a small voice offscreen", "Moisturiser. Right on time.", "Moisturiser"),
        s("Kid's hand reaches into frame", "Tell me your two-minute reset.", `Your two-minute reset? ${DISCLAIMER}`),
      ],
      cta: "Tell me your two-minute reset.",
      claimsUsed: [F_DAMP],
    },
    {
      title: "Skincare with interruptions",
      angleType: "relatable_problem",
      format: "Problem and solution",
      angle: "A routine that survives being interrupted",
      objective: "Show the step is quick enough for real life",
      differentiation: "Built around the chaos, not the quiet.",
      hook: "My skincare routine has to survive three interruptions",
      scenes: [
        s("Mom starts cleansing, gets called away", "My skincare routine has to survive three interruptions.", "Interruption 1"),
        s("Back at the sink, quick rinse", "Back. Face is still damp, good.", "Still damp. Keep going"),
        s("Serum pressed in fast", "Serum goes on damp skin anyway.", "Lightweight, fast-absorbing formula"),
        s("Called away again, comes back", "Moisturiser whenever I get back.", "Interruption 2"),
        s("Done, holding a sippy cup", "Done, sort of.", `Done. ${DISCLAIMER}`),
      ],
      cta: "Save this for the hectic mornings.",
      claimsUsed: [M_LIGHT, F_DAMP],
    },
    {
      title: "What stays on my counter",
      angleType: "value",
      format: "Talking head",
      angle: "Earning a spot on a crowded counter",
      objective: "Explain why it is worth the counter space",
      differentiation: "A direct-to-camera talk about choosing fewer products.",
      hook: "Why only one serum stays on my counter",
      scenes: [
        s("Crowded bathroom counter", "Why only one serum stays on my counter.", "Only one serum stays"),
        s("Holding serum to camera", "It reduces fine lines and I can use it every day.", "Reduces fine lines"),
        s("Applying on damp skin", "I use it morning and night.", "Morning and night"),
        s("Moving other bottles away", "Less on the counter, less to think about.", "Fewer products"),
        s("Clean counter shot", "That's my one.", `What's your one? ${DISCLAIMER}`),
      ],
      cta: "What's the one product you keep?",
      claimsUsed: [F_DAILY, "Reduces fine lines"],
    },
  ],
  "beauty-finds": [
    {
      title: "Four ingredients, read out loud",
      angleType: "education",
      format: "Listicle",
      angle: "Know what's in it before you buy",
      objective: "Teach the listed ingredients plainly",
      differentiation: "Pure ingredient education. No routine footage.",
      hook: "Four ingredients. Here's what each one is.",
      scenes: [
        s("Serum next to the ingredient card", "Four ingredients. Here's what each one is.", "4 key ingredients"),
        s("Caption: hyaluronic acid", "Hyaluronic acid. The hydration one.", "1. Hyaluronic acid"),
        s("Caption: vitamin B5", "Vitamin B5, also called panthenol.", "2. Vitamin B5 (panthenol)"),
        s("Caption: seaweed and radish", "Red seaweed extract and radish root ferment.", "3. Red seaweed  4. Radish root ferment"),
        s("Back to bottle", "That's what the brand lists.", `Follow for more breakdowns. ${DISCLAIMER}`),
      ],
      cta: "Follow for more breakdowns.",
      claimsUsed: [F_INGREDIENTS],
    },
    {
      title: "Texture check",
      angleType: "demonstration",
      format: "GRWM",
      angle: "See the texture and the layering order",
      objective: "Show how it looks and where it goes",
      differentiation: "Visual and close-up. The others are about reading and choosing.",
      hook: "Where this serum sits in my routine, in macro",
      scenes: [
        s("Macro of a drop on fingertip", "Where this serum sits in my routine, in macro.", "Texture check"),
        s("Face misted, still damp", "Damp skin first.", "Damp skin"),
        s("Serum pressed in, close-up", "Lightweight. It goes in fast.", "Lightweight, fast-absorbing formula"),
        s("Moisturiser layered on top", "Then moisturiser.", "Then moisturiser"),
        s("Finished glow shot in daylight", "Instant hydration and a visible glow, as the brand puts it.", `Instant hydration and visible glow. ${DISCLAIMER}`),
      ],
      cta: "Follow for more routine breakdowns.",
      claimsUsed: [M_LIGHT, F_DAMP, M_GLOW],
    },
    {
      title: "Routine find",
      angleType: "discovery",
      format: "Product discovery",
      angle: "A serum worth trying",
      objective: "Introduce the serum",
      differentiation: "A general product introduction.",
      hook: "Found a serum that actually fits my routine",
      scenes: [
        s("Unboxing on the vanity", "Found a serum that actually fits my routine.", "New find"),
        s("Holding the bottle", "It's a hydrating serum.", "Hydrating serum"),
        s("Applying", "It gives that flawless look.", "Flawless"),
        s("Close-up of skin", "Multi-layer hydration.", "Multi-layer hydration for plump, smooth, radiant skin"),
        s("Bottle on shelf", "Worth checking out.", `Worth a look. ${DISCLAIMER}`),
      ],
      cta: "Worth checking out.",
      claimsUsed: [M_LAYER],
    },
  ],
};

// Fixed versions of the 4 planted problems, keyed by account and concept title.
const grwmRevisions: Record<string, ConceptOut> = {
  "student-finds|The 8 AM sprint": {
    title: "The 8 AM sprint",
    angleType: "relatable_problem",
    format: "POV",
    angle: "Rushed mornings still get one skincare step",
    objective: "Make the routine feel possible on the worst morning",
    differentiation: "A comedic rush. The other two are calm.",
    hook: "Dorm sink. Five minutes. One extra step.",
    scenes: [
      s("Wide shot of a tiny dorm sink, timer on phone", "Dorm sink. Five minutes. One extra step.", "5:00 on the clock"),
      s("Splash and cleanse", "Face wash first.", "Step 1: cleanse"),
      s("Serum on still-wet skin", "This goes on while my face is still wet.", "Damp skin first"),
      s("Moisturiser, timer at 1:12", "Moisturiser. Time to spare.", "Lightweight, fast-absorbing formula"),
      s("Out the door", "Save this for your next 8 AM.", `Save for your next 8 AM. ${DISCLAIMER}`),
    ],
    cta: "Save this for your next 8 AM.",
    claimsUsed: [M_LIGHT, F_DAMP],
  },
  "mom-essentials|What stays on my counter": {
    title: "What stays on my counter",
    angleType: "value",
    format: "Talking head",
    angle: "Earning a spot on a crowded counter",
    objective: "Explain why it is worth the counter space",
    differentiation: "A direct-to-camera talk about choosing fewer products.",
    hook: "Why only one serum stays on my counter",
    scenes: [
      s("Crowded bathroom counter", "Why only one serum stays on my counter.", "Only one serum stays"),
      s("Holding serum to camera", "It's gentle enough to use every day, morning and night.", "Gentle enough for daily use"),
      s("Applying on damp skin", "It sinks in fast, so I'm not waiting around.", "Lightweight, fast-absorbing formula"),
      s("Moving other bottles away", "Less on the counter, less to think about.", "Fewer products"),
      s("Clean counter shot", "That's my one.", `What's your one? ${DISCLAIMER}`),
    ],
    cta: "What's the one product you keep?",
    claimsUsed: [F_DAILY, M_LIGHT],
  },
  "beauty-finds|Routine find": {
    title: "Three things I check first",
    angleType: "comparison",
    format: "Comparison",
    angle: "Practical checks before adding any serum",
    objective: "Give viewers a checklist, then apply it to this serum",
    differentiation: "A buyer's checklist. No other concept judges the product against criteria.",
    hook: "Three things I check before adding a new serum",
    scenes: [
      s("Checklist on screen, serum beside it", "Three things I check before adding a new serum.", "My 3 checks"),
      s("Reading the ingredient card", "One: what's actually in it.", `1. ${F_INGREDIENTS}`),
      s("Pointing at usage on the box", "Two: can I use it every day.", "2. Gentle enough for daily use, morning and night"),
      s("Pointing at the box claims", "Three: how it's made.", "3. Australian-made, vegan and cruelty-free"),
      s("Check marks on screen", "Three checks. That's my rule.", `Save your own checklist. ${DISCLAIMER}`),
    ],
    cta: "Save this checklist.",
    claimsUsed: [F_INGREDIENTS, F_DAILY, F_VEGAN],
  },
};

// ---------- Generic demo output for the other trends ----------

const angleRotation: Record<string, ConceptOut["angleType"][]> = {
  "student-finds": ["relatable_problem", "value", "education"],
  "mom-essentials": ["routine", "relatable_problem", "demonstration"],
  "beauty-finds": ["education", "demonstration", "comparison"],
};

function genericPlaybook(account: Account, trend: Trend): Omit<PlaybookOut, "rejectedTrends"> {
  return {
    trendId: trend.id,
    fitReason: `${trend.title} gives ${account.name} room for its ${account.voice.toLowerCase()} voice and its focus on ${account.pillars[0].toLowerCase()}.`,
    objective: `Show the serum inside ${account.audience.toLowerCase()}'s real day.`,
    audienceInsight: `${account.audience} mostly struggle with: ${account.painPoints[0].toLowerCase()}.`,
    angle: `${trend.title} told through ${account.pillars[0].toLowerCase()}`,
    hookDirection: trend.analysis.hookPattern,
    structure: trend.analysis.narrative.split(/,| then /i).map((x) => x.trim()).filter(Boolean).slice(0, 5).concat(["Call to action"]).slice(0, 5),
    format: "Talking head",
    visualDirection: account.visualDirection,
    productIntegration: trend.analysis.productIntegration,
    cta: "Save this for later.",
    safetyNotes: ["No results claims", "Disclaimer on the last scene"],
  };
}

function genericConcept(account: Account, trend: Trend, angleType: ConceptOut["angleType"], n: number): ConceptOut {
  const pain = account.painPoints[n % account.painPoints.length].toLowerCase();
  return {
    title: `${trend.title}: ${pain}`,
    angleType,
    format: "Talking head",
    angle: `${angleType.replace("_", " ")} for people dealing with ${pain}`,
    objective: `Connect the serum to ${pain}`,
    differentiation: `Uses the ${angleType.replace("_", " ")} angle.`,
    hook: `${account.name}: one serum step for ${pain}`,
    scenes: [
      s(`${account.visualDirection.split(",")[0]}, creator to camera`, `One serum step for ${pain}.`, `For ${pain}`),
      s("Cleanse at the sink", "Cleanse first.", "Step 1"),
      s("Serum on damp skin", "Serum on damp skin.", "Damp skin, then moisturiser"),
      s("Moisturiser on top", "Then moisturiser.", "Lightweight, fast-absorbing formula"),
      s("Creator to camera", "Save this for later.", `Save this. ${DISCLAIMER}`),
    ],
    cta: "Save this for later.",
    claimsUsed: [F_DAMP, M_LIGHT],
  };
}

export function demoPlaybook(account: Account, selected: Trend[]): PlaybookOut {
  const pick = selected.find((t) => t.id === "grwm") ?? selected[0];
  const base = pick.id === "grwm" ? grwmPlaybooks[account.id] : genericPlaybook(account, pick);
  return {
    ...base,
    rejectedTrends: selected
      .filter((t) => t.id !== pick.id)
      .map((t) => ({ trendId: t.id, reason: "Demo mode does not compare trends. Add a Gemini key for a real comparison." })),
  };
}

export function demoConcepts(account: Account, trend: Trend): ConceptOut[] {
  if (trend.id === "grwm" && grwmConcepts[account.id]) return structuredClone(grwmConcepts[account.id]);
  return (angleRotation[account.id] ?? ["relatable_problem", "education", "demonstration"]).map((a, i) =>
    genericConcept(account, trend, a, i),
  );
}

export function demoRevision(account: Account, trend: Trend, title: string, usedAngles: string[]): ConceptOut {
  const fixed = grwmRevisions[`${account.id}|${title}`];
  if (trend.id === "grwm" && fixed) return structuredClone(fixed);
  const all: ConceptOut["angleType"][] = ["relatable_problem", "discovery", "education", "routine", "value", "comparison", "demonstration"];
  const angle = all.find((a) => !usedAngles.includes(a)) ?? "demonstration";
  return genericConcept(account, trend, angle, usedAngles.length + 1);
}

export const DEMO_TREND_SAMPLE = {
  title: "Shelfie reset",
  platform: "Instagram" as const,
  description:
    "Creator stands in front of a messy bathroom shelf and says 'resetting my shelf for the new month'. Fast cuts of clearing everything off, wiping the shelf, then putting back only the products they actually use, one at a time, with a caption naming each one. Ends with a slow pan across the clean shelf. Upbeat audio, text captions on every cut.",
};

export const demoTrendAnalysis = {
  hookPattern: "A messy 'before' shelf with a reset statement in the first second",
  narrative: "Mess, clear everything, put back only what earns its place, reveal the clean shelf",
  format: "Reset or organizing video",
  visualDirection: "Fixed shelf framing, hands in frame, close-ups as each product returns",
  editingStyle: "Fast cuts while clearing, slower as products return, caption per product",
  emotionalTrigger: "Satisfaction and a fresh start",
  productIntegration: "The product is one of the few items that earns a spot back on the shelf",
  adaptationPotential: "Works for any product that sits on a shelf, counter or desk",
};

export const knownAccountIds = accounts.map((a) => a.id);
