import Link from "next/link";
import { getBrand, getCampaigns } from "@/lib/repo";
import { fmtDate, PageHeader, Tag } from "@/components/ui";
import { StatusPill } from "@/components/status-pill";
import { ResetDemo } from "@/components/reset-demo";
import { statusOf } from "@/lib/campaign";
import { objectiveTypeInfo } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [campaigns, brand] = await Promise.all([getCampaigns(), getBrand()]);
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Campaigns" />
        <div className="mb-8 flex items-start gap-2">
          <ResetDemo />
          <Link href="/campaigns/new" className="press rounded-md bg-ink px-4 py-2 text-sm font-medium text-inv hover:bg-ink/85">
            New campaign
          </Link>
        </div>
      </div>
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-panel p-10">
          <h2 className="text-xl font-semibold">Start with one campaign</h2>
          <p className="mt-1 max-w-lg text-muted">
            Write a brief, pick references, and Suki drafts a different playbook and concepts for each account. Every concept is checked against the Brand Brain before a person signs it off.
          </p>
          <Link href="/campaigns/new" className="press mt-5 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-inv hover:bg-ink/85">
            New campaign
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Link href={`/campaigns/${c.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 p-5 hover:bg-paper/60">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">{c.name}</h2>
                  <p className="text-muted">
                    {brand.name}, {brand.product.name}
                    {c.concepts.length ? ` · ${c.concepts.filter((x) => x.status === "approved").length} of ${c.concepts.length} concepts approved` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  <Tag tone="ink">{objectiveTypeInfo[c.objectiveType].label}</Tag>
                  {c.round > 1 && <Tag>Round {c.round}</Tag>}
                  {c.deadline && <span>Due {fmtDate(c.deadline)}</span>}
                  <StatusPill status={statusOf(c)} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
