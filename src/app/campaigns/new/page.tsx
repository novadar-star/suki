"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { PageHeader } from "@/components/ui";
import { BriefFields } from "@/components/brief-fields";
import { api } from "@/lib/client";
import type { Campaign } from "@/lib/schemas";

// The landing page can send a brief here as ?objective=.
export default function NewCampaignPage() {
  return (
    <Suspense>
      <NewCampaign />
    </Suspense>
  );
}

function NewCampaign() {
  const brief = useSearchParams().get("objective")?.trim().slice(0, 1500);
  const [sample, setSample] = useState(false);
  return brief && !sample ? <FromBrief brief={brief} onUseSample={() => setSample(true)} /> : <SampleForm brief={brief} />;
}

// A brief typed on the landing page becomes a new client: Suki drafts its Brand Brain and the campaign brief.
function FromBrief({ brief, onUseSample }: { brief: string; onUseSample: () => void }) {
  const router = useRouter();
  const [text, setText] = useState(brief);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await api<Campaign>("/api/clients", "POST", { brief: text });
      router.push(`/campaigns/${c.id}?stage=brief`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="New client" intro="Suki reads your brief and drafts the client's Brand Brain: product facts, claims it may use and claims it must avoid. Then it opens a campaign for it. Check the draft before you sign anything off." />
      <form onSubmit={submit} className="grid max-w-2xl gap-4">
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Brief</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} minLength={10} maxLength={1500} required className={inputClass} />
        </label>
        <ErrorNote message={error} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" type="submit" busy={busy}>
            {busy ? "Reading the brief" : "Set up client and campaign"}
          </Button>
          <Button type="button" variant="quiet" disabled={busy} onClick={onUseSample}>
            Use the sample client instead
          </Button>
        </div>
      </form>
    </>
  );
}

function SampleForm({ brief }: { brief?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const c = await api<Campaign>("/api/campaigns", "POST", Object.fromEntries(f));
      router.push(`/campaigns/${c.id}?stage=accounts`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="New campaign" intro="For Lust Minerals 4D Hyaluronic Acid Serum. The fields start with a sample brief you can change." />
      <form onSubmit={submit} className="grid max-w-2xl gap-5">
        <BriefFields
          initial={{
            name: "Hydration that fits real mornings",
            objectiveType: "organic",
            objective: brief?.slice(0, 500) || "Show the serum as one quick, easy step in very different daily routines.",
            keyMessage: "One lightweight step on damp skin, morning and night.",
            targetMarket: "People who want simple skincare that fits a busy day",
            deadline: "",
          }}
        />
        <ErrorNote message={error} />
        <div>
          <Button variant="primary" type="submit" busy={busy}>
            Create campaign
          </Button>
        </div>
      </form>
    </>
  );
}
