"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { api } from "@/lib/client";
import type { Trend } from "@/lib/types";

type Sample = { title: string; platform: "Instagram" | "TikTok"; description: string };

export function NewTrendForm({ demo, sample }: { demo: boolean; sample: Sample }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function useSample() {
    const f = form.current!;
    (f.elements.namedItem("title") as HTMLInputElement).value = sample.title;
    (f.elements.namedItem("platform") as HTMLSelectElement).value = sample.platform;
    (f.elements.namedItem("description") as HTMLTextAreaElement).value = sample.description;
  }

  return (
    <form
      ref={form}
      className="grid max-w-xl gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const t = await api<Trend>("/api/trends", "POST", Object.fromEntries(new FormData(e.currentTarget)));
          router.push(`/trends/${t.id}`);
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      {demo && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm">
          <p>No OpenAI key is set, so only the sample description can be analysed.</p>
          <Button type="button" className="mt-3" onClick={useSample}>
            Fill in the sample
          </Button>
        </div>
      )}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Name</span>
        <input name="title" required maxLength={120} placeholder="Shelfie reset" className={inputClass} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Platform</span>
        <select name="platform" className={inputClass} defaultValue="Instagram">
          <option>Instagram</option>
          <option>TikTok</option>
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Link to the video</span>
        <input name="sourceUrl" type="url" placeholder="https://www.instagram.com/reel/..." className={inputClass} />
        <span className="text-sm text-muted">Optional. Without a link, the reference is marked as illustrative.</span>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">What happens in the video</span>
        <textarea
          name="description"
          required
          minLength={40}
          maxLength={2000}
          rows={6}
          placeholder="Describe the first second, how the story moves, the shots, the captions and the audio."
          className={inputClass}
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Date you saw it</span>
        <input name="observedOn" type="date" required max={today} defaultValue={today} className={inputClass} />
      </label>
      <ErrorNote message={error} />
      <div>
        <Button type="submit" variant="primary" busy={busy}>
          {busy ? "Reading your description" : "Analyse and save"}
        </Button>
      </div>
    </form>
  );
}
