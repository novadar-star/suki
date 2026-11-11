import Link from "next/link";
import { brand } from "@/data/brand";
import { getCampaigns } from "@/lib/repo";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const campaigns = await getCampaigns();
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Campaigns" />
        <Link href="/campaigns/new" className="press mb-8 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/85">
          New campaign
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-panel p-10">
          <h2 className="text-xl font-semibold">Start with one campaign</h2>
          <p className="mt-1 max-w-lg text-muted">
            Pick a trend, then Suki writes a different playbook for each account and checks that no two videos overlap.
          </p>
          <Link href="/campaigns/new" className="press mt-5 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
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
                  </p>
                </div>
                <p className="text-sm text-muted">
                  {c.concepts.length ? `${c.concepts.length} concepts` : c.playbooks.length ? `${c.playbooks.length} playbooks` : "Not started"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
