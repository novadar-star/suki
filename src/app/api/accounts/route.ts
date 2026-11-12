import { NextResponse } from "next/server";
import { getAccounts, saveAccount } from "@/lib/repo";
import { accountIn } from "@/lib/schemas";
import { body, fail } from "@/lib/http";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "account";

export async function POST(req: Request) {
  try {
    const input = accountIn.parse(await body(req));
    const existing = await getAccounts();
    if (existing.some((a) => a.handle.toLowerCase() === input.handle.toLowerCase() && a.platform === input.platform))
      return NextResponse.json({ error: `${input.handle} on ${input.platform} is already in the list.` }, { status: 409 });
    let id = slug(input.name);
    for (let n = 2; existing.some((a) => a.id === id); n++) id = `${slug(input.name)}-${n}`;
    return NextResponse.json(await saveAccount({ ...input, id, history: [] }), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
