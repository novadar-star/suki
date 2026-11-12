import { NextResponse } from "next/server";
import { getAccounts, getCampaigns, removeAccount, saveAccount } from "@/lib/repo";
import { accountIn } from "@/lib/schemas";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const current = (await getAccounts()).find((a) => a.id === id);
    if (!current) return notFound("Account");
    const input = accountIn.parse(await body(req));
    // Past hooks are kept as they are. They are not edited from this form.
    return NextResponse.json(await saveAccount({ ...current, ...input, id }));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const accounts = await getAccounts();
    const current = accounts.find((a) => a.id === id);
    if (!current) return notFound("Account");
    if (accounts.length === 1) return NextResponse.json({ error: "Keep at least one account. Add another before removing this one." }, { status: 409 });
    const usedBy = (await getCampaigns()).filter((c) => c.accountIds.includes(id) || c.concepts.some((k) => k.accountId === id) || c.playbooks.some((p) => p.accountId === id));
    if (usedBy.length)
      return NextResponse.json(
        { error: `${current.name} is used by ${usedBy.length === 1 ? `the campaign "${usedBy[0].name}"` : `${usedBy.length} campaigns`}. Remove it from ${usedBy.length === 1 ? "that campaign" : "those campaigns"} first.` },
        { status: 409 },
      );
    await removeAccount(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
