"use client";

import Link from "next/link";
import clsx from "clsx";
import { Button } from "../button";
import { BriefFields } from "../brief-fields";
import { ConfidenceBadge } from "../confidence-badge";
import { useWorkspace } from "./workspace";

export function BriefStage() {
  const { campaign, busy, run, brand } = useWorkspace();
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form
        className="grid max-w-2xl gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          run("brief", `/api/campaigns/${campaign.id}`, "PATCH", Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <BriefFields initial={campaign} />
        {campaign.signedOffAt && <p className="text-sm text-warn">Changing the objective type reopens the signed-off deliverables.</p>}
        <div>
          <Button type="submit" busy={busy === "brief"}>
            Save brief
          </Button>
        </div>
      </form>
      <div className="grid h-fit gap-4">
      {campaign.learnings.length > 0 && (
        <aside className="rounded-xl border border-ink/20 bg-panel p-5">
          <h2 className="font-semibold">Carried over from round {campaign.round - 1}</h2>
          <p className="mt-1 text-xs text-muted">The Strategist reads these before writing playbooks.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {campaign.learnings.map((l) => (
              <li key={l} className="border-l-2 border-ink/30 pl-3">
                {l}
              </li>
            ))}
          </ul>
          {campaign.parentId && (
            <Link href={`/campaigns/${campaign.parentId}?stage=results`} className="mt-3 inline-block text-sm underline underline-offset-2">
              Open round {campaign.round - 1}
            </Link>
          )}
        </aside>
      )}
      <aside className="h-fit rounded-xl border border-line bg-panel p-5">
        <h2 className="font-semibold">{brand.product.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {brand.claims.filter((c) => c.kind === "product_fact").length} product facts and{" "}
          {brand.claims.filter((c) => c.kind === "marketing_claim").length} marketing claims. Every concept may use only these.
        </p>
        <Link href="/brand" className="mt-3 inline-block text-sm underline underline-offset-2">
          Open Brand Brain
        </Link>
      </aside>
      </div>
    </div>
  );
}

export function AccountsStage() {
  const { campaign, busy, run, accounts } = useWorkspace();
  const toggle = (id: string) => {
    const on = campaign.accountIds.includes(id);
    const accountIds = on ? campaign.accountIds.filter((x) => x !== id) : [...campaign.accountIds, id];
    run(`account:${id}`, `/api/campaigns/${campaign.id}`, "PATCH", { accountIds });
  };
  return (
    <>
      <p className="mb-5 max-w-2xl text-muted">Each selected account gets its own playbook and three concepts.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {accounts.map((a) => {
          const on = campaign.accountIds.includes(a.id);
          return (
            <label
              key={a.id}
              className={clsx(
                "press flex cursor-pointer gap-3 rounded-xl border bg-panel p-4",
                on ? "border-ink" : "border-line opacity-70",
                busy === `account:${a.id}` && "opacity-50",
              )}
            >
              <input
                type="checkbox"
                checked={on}
                disabled={!!busy}
                onChange={() => toggle(a.id)}
                className="mt-1 size-4 accent-ink"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </span>
                <span className="mt-1 block text-sm text-muted">{a.editorialIdentity}</span>
                <span className="mt-2 block text-sm">{a.voice}</span>
              </span>
            </label>
          );
        })}
      </div>
    </>
  );
}

export function TrendsStage() {
  const { campaign, trends, busy, run } = useWorkspace();
  const full = campaign.trendIds.length >= 3;
  const toggle = (id: string) => {
    const on = campaign.trendIds.includes(id);
    const trendIds = on ? campaign.trendIds.filter((x) => x !== id) : [...campaign.trendIds, id];
    run(`trend:${id}`, `/api/campaigns/${campaign.id}`, "PATCH", { trendIds });
  };
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl text-muted">
          Pick up to 3. For each account, Suki picks the best fit and explains why. None of these are live trend data. The label shows how much evidence each one has.
        </p>
        <Link href="/trends/new" className="text-sm underline underline-offset-2">
          Add a reference
        </Link>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
        {trends.map((t) => {
          const on = campaign.trendIds.includes(t.id);
          return (
            <li key={t.id}>
              <label className={clsx("flex cursor-pointer items-center gap-4 p-4 hover:bg-paper/60", !on && full && "cursor-not-allowed opacity-50")}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!!busy || (!on && full)}
                  onChange={() => toggle(t.id)}
                  className="size-4 accent-ink"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{t.title}</span>
                  <span className="block text-sm text-muted">{t.description}</span>
                </span>
                <ConfidenceBadge level={t.confidence} />
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
