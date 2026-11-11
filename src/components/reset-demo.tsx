"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ErrorNote } from "./button";

export function ResetDemo() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reset() {
    if (!window.confirm("Reset the demo? This deletes every campaign and any added trend references, then adds the two demo campaigns. It can't be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Reset failed.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="quiet" busy={busy} onClick={reset}>
        {!busy && <RotateCcw aria-hidden className="size-4" />}
        Reset demo
      </Button>
      <ErrorNote message={error} />
    </div>
  );
}
