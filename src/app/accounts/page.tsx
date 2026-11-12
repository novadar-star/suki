import Link from "next/link";
import { seedData } from "@/data/seed";
import { getAccounts } from "@/lib/repo";
import { Field, List, PageHeader, Tag } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const isSample = (id: string) => seedData.accounts.some((a) => a.id === id);
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Accounts"
          intro="Two accounts can reach the same people and still sound nothing alike. Each account keeps its own voice, topics and past hooks."
        />
        <Link href="/accounts/new" className="press inline-flex min-h-9 items-center rounded-md bg-ink px-4 text-sm font-medium text-inv hover:bg-ink/85">
          Add account
        </Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {accounts.map((a) => (
          <article
            key={a.id}
            className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel xl:row-span-3 xl:grid xl:grid-rows-subgrid xl:gap-0"
            style={{ borderTop: `4px solid ${a.color}` }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold">{a.name}</h2>
                <Link href={`/accounts/${a.id}/edit`} className="press shrink-0 rounded-md border border-line px-2.5 py-1 text-sm font-medium hover:border-ink/30" aria-label={`Edit ${a.name}`}>
                  Edit
                </Link>
              </div>
              <p className="text-sm text-muted">
                {a.handle} on {a.platform}
              </p>
              <p className="mt-3 text-lg leading-snug">{a.editorialIdentity}</p>
            </div>
            <dl className="grid gap-4 border-t border-line p-5">
              <Field label="Audience">{a.audience}</Field>
              <Field label="Voice">{a.voice}</Field>
              <Field label="Topics">
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {a.pillars.map((p) => (
                    <Tag key={p}>{p}</Tag>
                  ))}
                </div>
              </Field>
              <Field label="Formats it uses">{a.formats.join(", ")}</Field>
              <Field label="Look">{a.visualDirection}</Field>
              <Field label="Pain points">
                <List items={a.painPoints} />
              </Field>
            </dl>
            <div className="border-t border-line bg-paper/60 p-5">
              <h3 className="mb-2 text-sm font-semibold">Past hooks</h3>
              {a.history.length === 0 && <p className="text-sm text-muted">None yet. Hooks from signed-off campaigns will be listed here.</p>}
              <ul className="space-y-2">
                {a.history.map((h) => (
                  <li key={h.hook}>
                    <p>&ldquo;{h.hook}&rdquo;</p>
                    <p className="text-sm text-muted">
                      {h.format} ·{" "}
                      {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </li>
                ))}
              </ul>
              {isSample(a.id) && a.history.length > 0 && <p className="mt-3 text-xs text-muted">Sample history for the demo.</p>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
