import path from "path";
import { promises as fs } from "fs";
import os from "os";
import { NextResponse } from "next/server";
import { accounts } from "@/data/accounts";
import { getCampaign } from "@/lib/repo";
import { fail, notFound } from "@/lib/http";

export const maxDuration = 300;
type Ctx = { params: Promise<{ id: string; cid: string }> };

// Renders the animatic to MP4. Works when the app runs on your own computer.
export async function POST(_req: Request, { params }: Ctx) {
  if (process.env.VERCEL)
    return NextResponse.json({ error: "Video export runs on your own computer only. Run the app locally to export." }, { status: 501 });
  try {
    const { id, cid } = await params;
    const c = await getCampaign(id);
    const concept = c?.concepts.find((x) => x.id === cid);
    if (!c || !concept) return notFound("Concept");
    const account = accounts.find((a) => a.id === concept.accountId);
    if (!account) return notFound("Account");

    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");
    const inputProps = { accountName: account.name, color: account.color, scenes: concept.scenes };
    const browserExecutable = process.env.CHROME_PATH || null;
    const serveUrl = await bundle({ entryPoint: path.resolve("src/video/index.ts"), publicDir: path.resolve("public") });
    const composition = await selectComposition({ serveUrl, id: "Ugc", inputProps, browserExecutable });
    const out = path.join(os.tmpdir(), `suki-${cid}-${Date.now()}.mp4`);
    await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, inputProps, browserExecutable });
    const file = await fs.readFile(out);
    await fs.unlink(out).catch(() => {});
    return new Response(file, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${account.id}-${concept.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp4"`,
      },
    });
  } catch (e) {
    return fail(e);
  }
}
