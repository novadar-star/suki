# Suki

Turns one campaign into different short-form video plans for each social account, then checks that no two overlap.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

It works with no setup:
- **AI:** without a Gemini key, Suki uses saved sample answers. The full sample set is for the "Get ready with me" trend.
- **Saving:** without Supabase, data is saved to `.data/db.json` on your computer.

The sidebar shows which mode is on.

## Add the real services

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | aistudio.google.com, then "Get API key" |
| `GEMINI_MODEL` | Leave as `gemini-2.5-flash` unless you want another model |
| `SUPABASE_URL` | Supabase project, then Settings, then API |
| `SUPABASE_SECRET_KEY` | Same page. Use the secret key (server only). Never put it in browser code |

For Supabase, run `supabase/migrations/0001_docs.sql` once in the SQL editor. Restart `npm run dev` after any change to `.env.local`.

## Demo path

1. Campaigns, then New campaign. Pick **Organic** or **Paid**, then Create campaign.
2. Trends: pick "Get ready with me".
3. Playbooks: Make playbooks, then approve all three.
4. Content: Make concepts. Open one to see the script, storyboard and video preview.
5. Review & sign-off: Run portfolio check. It catches 4 problems planted in the sample answers. Press "Rewrite this concept" on each until none are left.
6. Tick the concepts to produce, then **Sign off**. Sign-off is blocked while any ticked concept has a must-fix problem, on the page and on the server.
7. Results: type in real numbers, or press "Fill with sample numbers" (labeled as samples everywhere). Analyze, then **Start round 2**. The learnings go into the next brief and the AI prompt.

Organic and paid are judged differently. Paid adds two must-fix rules: the product must show in the first two scenes, and the CTA must ask for one clear action. Organic flags hard-sell language. Results rank organic by watch time plus saves and shares, and paid by ROAS.

`npx tsx scripts/check-demo.ts` and `npx tsx scripts/check-paid.ts` check the sample answers against the rules.

## Video

- The preview plays in the browser.
- "Export MP4" renders on your own computer and takes about a minute. The first export downloads a headless Chrome.
- `npm run render -- <campaignId> <conceptId>` saves an MP4 to `out/` (the app must be running).
- Videos are animatics: text, captions and the product image. They are labeled "AI-generated animatic".

## How the honest parts work

- **Trends:** Suki has no live trend data. A trend's label comes from a fixed rule on dated evidence: 0 items is a Reference example, 1 is Observed, 2 or more is Supported. All within 30 days. The AI never sets it.
- **Portfolio check:** plain code in `src/lib/checks.ts`, including the organic and paid rules. It flags repeated angles, overlapping hooks, repeats of past hooks, prohibited claims, banned words, claims not in the Brand Brain, and missing disclaimers.
- **Claims:** every concept must list the claims it uses, word for word from the Brand Brain.

- **Results:** Suki has no platform connection. Numbers are typed in or are labeled samples. The ranking and "test next" list are fixed rules in `src/lib/campaign.ts`, not AI.

## Known gaps

- On Vercel without Supabase, data is saved in temporary server storage and can disappear between requests. Add Supabase before a live demo.

- No login. Anyone with the link can edit. Fine for a demo, not for real client work.
- Brand guidelines are samples written for the demo.
- The product image is a drawing. Put a real photo at `public/product/serum.svg` or change the path in `src/data/brand.ts`.
