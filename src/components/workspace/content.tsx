"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Maximize2, X } from "lucide-react";
import { accounts } from "@/data/accounts";
import { angleLabel, type Concept } from "@/lib/schemas";
import { Button, inputClass } from "../button";
import { Tag } from "../ui";
import { useWorkspace } from "./workspace";
import { assetId } from "@/lib/campaign";
import { brand } from "@/data/brand";
import { VideoPreview } from "./video-preview";

export function ContentStage() {
  const { campaign, busy, run } = useWorkspace();
  const approved = campaign.playbooks.filter((p) => p.status === "approved");
  const [open, setOpen] = useState<string | null>(null);
  const openConcept = campaign.concepts.find((c) => c.id === open);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-muted">Three concepts per approved playbook. Each one takes a different angle. Open a concept to see its script and storyboard.</p>
        <div className="flex flex-wrap gap-2">
        {campaign.concepts.length > 0 && (
          <a href={`/api/campaigns/${campaign.id}/export`} className="press inline-flex min-h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink">
            Export scripts
          </a>
        )}
        <Button
          variant={campaign.concepts.length ? "secondary" : "primary"}
          disabled={!approved.length}
          busy={busy === "concepts"}
          onClick={() => run("concepts", `/api/campaigns/${campaign.id}/concepts`, "POST")}
        >
          {busy === "concepts" ? "Writing concepts" : campaign.concepts.length ? "Remake all concepts" : "Make concepts"}
        </Button>
        </div>
      </div>
      {!approved.length && <p className="text-warn">Approve at least one playbook first.</p>}

      <div className="grid gap-6 xl:grid-cols-3">
        {approved.map((p) => {
          const a = accounts.find((x) => x.id === p.accountId)!;
          const list = campaign.concepts.filter((c) => c.accountId === p.accountId);
          return (
            <section key={p.accountId} aria-labelledby={`col-${a.id}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 id={`col-${a.id}`} className="flex items-center gap-2 text-lg font-semibold">
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </h2>
                {list.length > 0 && (
                  <Button
                    variant="quiet"
                    busy={busy === `concepts:${a.id}`}
                    onClick={() => run(`concepts:${a.id}`, `/api/campaigns/${campaign.id}/concepts`, "POST", { accountId: a.id })}
                  >
                    Remake these 3
                  </Button>
                )}
              </div>
              <div className="grid gap-3">
                {list.length === 0 && <p className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">No concepts yet.</p>}
                {list.map((c) => (
                  <ConceptCard key={c.id} c={c} color={a.color} onOpen={() => setOpen(c.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {openConcept && <ConceptDialog c={openConcept} onClose={() => setOpen(null)} />}
    </>
  );
}

function ConceptCard({ c, color, onOpen }: { c: Concept; color: string; onOpen: () => void }) {
  const { campaign, busy, run } = useWorkspace();
  const setStatus = (status: Concept["status"]) =>
    run(`c:${c.id}`, `/api/campaigns/${campaign.id}`, "PATCH", {
      concepts: campaign.concepts.map((x) => (x.id === c.id ? { ...x, status } : x)),
    });

  return (
    <article className={clsx("rounded-xl border border-line bg-panel", c.status === "rejected" && "opacity-55")}>
      <button onClick={onOpen} className="block w-full rounded-t-xl p-4 text-left hover:bg-paper/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <Maximize2 aria-hidden className="order-last ml-auto size-4 text-muted" />
          <span className="sr-only">Open script and storyboard.</span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ background: color }}>
            {angleLabel[c.angleType]}
          </span>
          <Tag>{c.format}</Tag>
          {c.status !== "draft" && <Tag tone={c.status === "approved" ? "ok" : "bad"}>{c.status === "approved" ? "Approved" : "Rejected"}</Tag>}
        </div>
        <p className="mt-3 font-display text-xl font-semibold leading-snug">&ldquo;{c.hook}&rdquo;</p>
        <code className="mt-1 block font-mono text-[11px] text-muted">{assetId(campaign, c.id)}</code>
        <p className="mt-2 text-sm text-muted">
          {c.title}. {c.differentiation}
        </p>
        {c.revisedFor && <p className="mt-2 text-sm text-ink">Rewritten to fix: {c.revisedFor}</p>}
      </button>
      <div className="flex flex-wrap gap-1 border-t border-line p-2">
        {c.status !== "approved" && (
          <Button variant="quiet" busy={busy === `c:${c.id}`} onClick={() => setStatus("approved")}>
            Approve
          </Button>
        )}
        <Button variant="quiet" busy={busy === `remake:${c.id}`} onClick={() => run(`remake:${c.id}`, `/api/campaigns/${campaign.id}/concepts/${c.id}`, "POST")}>
          Remake
        </Button>
        {c.status !== "rejected" && (
          <Button variant="danger" disabled={!!busy} onClick={() => setStatus("rejected")}>
            Reject
          </Button>
        )}
      </div>
    </article>
  );
}

export function PhoneFrame({ scene, n, color }: { scene: Concept["scenes"][number]; n: number; color: string }) {
  return (
    <figure className="w-[150px] shrink-0">
      <div className="relative flex aspect-[9/16] flex-col overflow-hidden rounded-[18px] border-[3px] border-[#1c1f23] bg-[#1c1f23] p-2.5 text-white">
        <p className="text-[10px] leading-tight text-white/60">{scene.visual}</p>
        <p className="mt-auto rounded-md px-2 py-1.5 text-center text-[13px] font-semibold leading-tight" style={{ background: color }}>
          {scene.onScreen || "No on-screen text"}
        </p>
      </div>
      <figcaption className="mt-1.5 text-xs text-muted">Scene {n}</figcaption>
    </figure>
  );
}

function ConceptDialog({ c, onClose }: { c: Concept; onClose: () => void }) {
  const { campaign, busy, run } = useWorkspace();
  const ref = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState<"storyboard" | "video">("storyboard");
  const a = accounts.find((x) => x.id === c.accountId)!;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next: Concept = {
      ...c,
      origin: "edited",
      hook: String(f.get("hook")).trim() || c.hook,
      cta: String(f.get("cta")).trim() || c.cta,
      scenes: c.scenes.map((s, i) => ({
        visual: String(f.get(`visual-${i}`)).trim() || s.visual,
        voiceover: String(f.get(`vo-${i}`)).trim(),
        onScreen: String(f.get(`text-${i}`)).trim(),
      })),
    };
    const ok = await run(`edit:${c.id}`, `/api/campaigns/${campaign.id}`, "PATCH", {
      concepts: campaign.concepts.map((x) => (x.id === c.id ? next : x)),
    });
    if (ok) setEditing(false);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="concept-title"
      className="m-auto max-h-[92vh] w-[min(1080px,94vw)] rounded-2xl border border-line bg-panel p-0 text-ink backdrop:bg-black/40"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-panel p-5">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: a.color }} />
            {a.name}, {angleLabel[c.angleType]}, {c.format}
          </p>
          <h2 id="concept-title" className="mt-1 text-2xl font-semibold">
            {c.title}
          </h2>
        </div>
        <Button variant="quiet" aria-label="Close" onClick={() => ref.current?.close()}>
          <X className="size-5" />
        </Button>
      </div>

      <div className="p-5">
        <dl className="mb-6 grid gap-4 text-[15px] md:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Angle</dt>
            <dd>{c.angle}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Objective</dt>
            <dd>{c.objective}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Claims used</dt>
            <dd>
              {c.claimsUsed.length ? (
                <ul className="space-y-1">
                  {c.claimsUsed.map((t) => {
                    const id = brand.claims.find((x) => x.text.toLowerCase() === t.toLowerCase())?.id;
                    return (
                      <li key={t} className="flex gap-2">
                        <code className={`shrink-0 font-mono text-xs ${id ? "text-ink" : "text-bad"}`}>{id ?? "Not in Brand Brain"}</code>
                        <span>{t}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                "None"
              )}
            </dd>
          </div>
        </dl>

        <div className="mb-3 flex gap-1" role="tablist" aria-label="View">
          {(["storyboard", "video"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={clsx("press rounded-md px-3 py-1.5 text-sm", view === v ? "bg-ink text-inv" : "text-muted hover:bg-paper")}
            >
              {v === "storyboard" ? "Storyboard" : "Video preview"}
            </button>
          ))}
        </div>
        <div className="mb-6">
          {view === "storyboard" ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {c.scenes.map((s, i) => (
                <PhoneFrame key={i} scene={s} n={i + 1} color={a.color} />
              ))}
            </div>
          ) : (
            <VideoPreview
              props={{ accountName: a.name, color: a.color, scenes: c.scenes }}
              renderUrl={`/api/campaigns/${campaign.id}/concepts/${c.id}/video`}
              fileName={`${a.id}-${c.id}.mp4`}
            />
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Hook</span>
              <input name="hook" defaultValue={c.hook} className={inputClass} />
            </label>
            {c.scenes.map((s, i) => (
              <fieldset key={i} className="grid gap-2 rounded-lg border border-line p-3 md:grid-cols-3">
                <legend className="px-1 text-sm font-medium">Scene {i + 1}</legend>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">Visual</span>
                  <textarea name={`visual-${i}`} rows={2} defaultValue={s.visual} className={inputClass} />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">Voiceover</span>
                  <textarea name={`vo-${i}`} rows={2} defaultValue={s.voiceover} className={inputClass} />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">On-screen text</span>
                  <textarea name={`text-${i}`} rows={2} defaultValue={s.onScreen} className={inputClass} />
                </label>
              </fieldset>
            ))}
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Call to action</span>
              <input name="cta" defaultValue={c.cta} className={inputClass} />
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" busy={busy === `edit:${c.id}`}>
                Save changes
              </Button>
              <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[15px]">
                <thead className="text-sm text-muted">
                  <tr className="border-b border-line">
                    <th className="w-16 py-2 font-normal">Scene</th>
                    <th className="py-2 font-normal">Visual</th>
                    <th className="py-2 font-normal">Voiceover</th>
                    <th className="py-2 font-normal">On-screen text</th>
                  </tr>
                </thead>
                <tbody>
                  {c.scenes.map((s, i) => (
                    <tr key={i} className="border-b border-line align-top">
                      <td className="py-2.5">{i + 1}</td>
                      <td className="py-2.5 pr-4">{s.visual}</td>
                      <td className="py-2.5 pr-4">{s.voiceover || "None"}</td>
                      <td className="py-2.5">{s.onScreen || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              <span className="text-sm text-muted">Call to action: </span>
              {c.cta}
            </p>
            <div className="mt-5">
              <Button onClick={() => setEditing(true)}>Edit script</Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
