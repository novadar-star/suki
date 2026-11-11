# Myrtis

Turns one campaign into different short-form video plans for each social account, then checks that no two overlap.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

It works with no setup:
- **AI:** without a Gemini key, Myrtis uses saved sample answers. The full sample set is for the "Get ready with me" trend.
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

1. Campaigns, then New campaign, then Create campaign.
2. Trends: pick "Get ready with me".
3. Playbooks: Make playbooks, then approve all three.
4. Content: Make concepts. Open one to see the script, storyboard and video preview.
5. Portfolio review: Run portfolio check. It catches 4 problems planted in the sample answers. Press "Rewrite this concept" on each until none are left.

## Video

- The preview plays in the browser.
- "Export MP4" renders on your own computer and takes about a minute. The first export downloads a headless Chrome.
- `npm run render -- <campaignId> <conceptId>` saves an MP4 to `out/` (the app must be running).
- Videos are animatics: text, captions and the product image. They are labeled "AI-generated animatic".

## How the honest parts work

- **Trends:** Myrtis has no live trend data. A trend's label comes from a fixed rule on dated evidence: 0 items is a Reference example, 1 is Observed, 2 or more is Supported. All within 30 days. The AI never sets it.
- **Portfolio check:** plain code in `src/lib/checks.ts`. It flags repeated angles, overlapping hooks, repeats of past hooks, prohibited claims, banned words, claims not in the Brand Brain, and missing disclaimers.
- **Claims:** every concept must list the claims it uses, word for word from the Brand Brain.

## Known gaps

- No login. Anyone with the link can edit. Fine for a demo, not for real client work.
- Brand guidelines are samples written for the demo.
- The product image is a drawing. Put a real photo at `public/product/serum.svg` or change the path in `src/data/brand.ts`.
