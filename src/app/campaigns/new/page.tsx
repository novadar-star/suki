"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/client";
import type { Campaign } from "@/lib/schemas";

export default function NewCampaign() {
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
      <form onSubmit={submit} className="grid max-w-xl gap-5">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Campaign name</span>
          <input name="name" required maxLength={120} defaultValue="Hydration that fits real mornings" className={inputClass} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Objective</span>
          <textarea
            name="objective"
            required
            maxLength={500}
            rows={3}
            defaultValue="Show the serum as one quick, easy step in very different daily routines."
            className={inputClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Target market</span>
          <input
            name="targetMarket"
            required
            maxLength={300}
            defaultValue="People who want simple skincare that fits a busy day"
            className={inputClass}
          />
        </label>
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
