"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorNote } from "@/components/button";
import { PageHeader } from "@/components/ui";
import { BriefFields } from "@/components/brief-fields";
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
      <form onSubmit={submit} className="grid max-w-2xl gap-5">
        <BriefFields
          initial={{
            name: "Hydration that fits real mornings",
            objectiveType: "organic",
            objective: "Show the serum as one quick, easy step in very different daily routines.",
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
