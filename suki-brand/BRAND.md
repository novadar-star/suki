# Suki brand kit

The design system is the source of truth for the app. If a token changes, change it in `tokens.css` here first, then in the app.

## Icon
- `icon.webp` — the official Suki app icon: a lavender ghost with a trailing wisp on a deep-violet squircle.
- Use it for: favicon, app header logo (28–32px, rounded with `--r-icon`), empty states, loading screens, the prototype's title bar.
- Name in UI: **Suki** (not "Myrtis" and not "Sukic").

## Color
- Brand accent is **violet `#7c3aed`** (taken from the icon). It replaces the old pink `#d6336c`.
- **Violet means Suki, ink means a person.** Violet marks anything Suki wrote or is doing (the "Suki is working" badge, links, focus rings, chart series 1). Primary buttons, "needs you" badges and counts, approvals and sign-off are ink (`--inv-bg`), not violet.
- The ghost icon appears only where Suki is acting (drafting, checking, rewriting), plus the logo. Never on a person's decision.
- The gradient ("the veil", `--brand-gradient` deep and `--brand-gradient-light`) is only for the landing page, sign-up, empty states and the brand page. Never behind tables, forms or review screens.
- Neutrals are now violet-biased on a white page (Studio direction, chosen by the user): see `tokens.css`. Status colors, radii and easing are unchanged.

## Type
- Changed at the user's request (the old pairing read as generic AI output).
- Display: **Gabarito** (headings, campaign names) · Body: **Onest** (all UI) · Utility: **Sometype Mono** (labels, stage numbers like `01 / BRIEF`, counts; italic for the one or two accent words in a marketing headline).
- Bricolage Grotesque, Instrument Sans, Instrument Serif and the short-lived Funnel/DM Mono set are retired. The user picked this "Soft" pairing from four options.

## Idea and voice
- Brand idea: **"Suki ghostwrites. You sign."**
- Voice: plain and honest about limits ("Suki has no live trend data."). No "AI-powered", no "magic", no "Oops".

## Shared names
Both naming schemes are aliased in `tokens.css`, so neither codebase needs a rename:
- Prototype: `--signal`, `--signal-soft`, `--bg`, `--panel`, `--ink`, `--muted`, `--line`
- Ops Studio (Tailwind v4 `@theme`): `--color-accent`, `--color-accent-soft`, `--color-paper`, `--color-panel`, `--color-ink`, `--color-muted`, `--color-line`

## Shared vocabulary
Both projects use the same names for the same things, such as Brand, Accounts, Trends, Campaigns, Asset IDs, QC and Sign-off. If one project adds a new concept or component, tell the other session so the prototype and the app don't drift apart.
