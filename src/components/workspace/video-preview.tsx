"use client";

import { Player } from "@remotion/player";
import { useState } from "react";
import { Download } from "lucide-react";
import { FPS, Ugc, ugcDuration, type UgcProps } from "@/video/ugc";
import { Button, ErrorNote } from "../button";

export function VideoPreview({ props, renderUrl, fileName }: { props: UgcProps; renderUrl: string; fileName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(renderUrl, { method: "POST" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Export failed.");
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="w-[270px] overflow-hidden rounded-[18px] border-[3px] border-ink">
        <Player
          component={Ugc}
          inputProps={props}
          durationInFrames={ugcDuration(props)}
          fps={FPS}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: "100%", aspectRatio: "9 / 16" }}
          initialFrame={24}
          controls
          loop
        />
      </div>
      <Button onClick={download} busy={busy}>
        {!busy && <Download aria-hidden className="size-4" />}
        {busy ? "Rendering MP4, about a minute" : "Export MP4"}
      </Button>
      <ErrorNote message={error} />
    </div>
  );
}
