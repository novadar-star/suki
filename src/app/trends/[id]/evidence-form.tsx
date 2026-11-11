"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { api } from "@/lib/client";

export function EvidenceForm({ trendId }: { trendId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  if (!open)
    return (
      <Button className="mt-4" onClick={() => setOpen(true)}>
        Log evidence
      </Button>
    );

  return (
    <form
      className="mt-4 grid gap-3 border-t border-line pt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        setError(null);
        try {
          await api(`/api/trends/${trendId}/evidence`, "POST", Object.fromEntries(new FormData(form)));
          form.reset();
          setOpen(false);
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-1 text-sm">
        <span className="text-muted">What you saw</span>
        <select name="type" className={inputClass} defaultValue="feed_observation">
          <option value="feed_observation">Seen on my feed</option>
          <option value="platform_page">Platform page (for example TikTok Creative Center)</option>
          <option value="article">Article or report</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Note</span>
        <textarea name="note" required minLength={3} maxLength={500} rows={2} placeholder="Seen 4 times this week from beauty creators" className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Link (optional)</span>
        <input name="url" type="url" placeholder="https://" className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Date seen</span>
        <input name="observedOn" type="date" required max={today} defaultValue={today} className={inputClass} />
      </label>
      <ErrorNote message={error} />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" busy={busy}>
          Save evidence
        </Button>
        <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
