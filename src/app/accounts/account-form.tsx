"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { api } from "@/lib/client";
import type { Account } from "@/lib/types";

const COLORS = [
  { value: "#3563E9", label: "Blue" },
  { value: "#17936B", label: "Green" },
  { value: "#C2410C", label: "Orange" },
  { value: "#7C3AED", label: "Violet" },
  { value: "#BE185D", label: "Pink" },
  { value: "#0E7490", label: "Teal" },
];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

// One form for adding and editing. Lists are typed one item per line.
export function AccountForm({ account }: { account?: Account }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const list = (items?: string[]) => (items ?? []).join("\n");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      await api(account ? `/api/accounts/${account.id}` : "/api/accounts", account ? "PATCH" : "POST", data);
      router.push("/accounts");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function remove() {
    if (!account) return;
    setBusy("remove");
    setError(null);
    try {
      await api(`/api/accounts/${account.id}`, "DELETE");
      router.push("/accounts");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
      setConfirming(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Name">
          <input name="name" required maxLength={60} defaultValue={account?.name} className={inputClass} placeholder="Student Finds" />
        </Row>
        <Row label="Handle">
          <input name="handle" required maxLength={60} defaultValue={account?.handle} className={inputClass} placeholder="@studentfinds" />
        </Row>
        <Row label="Platform">
          <select name="platform" defaultValue={account?.platform ?? "Instagram"} className={inputClass}>
            <option>Instagram</option>
            <option>TikTok</option>
          </select>
        </Row>
        <Row label="Colour" hint="Marks this account on playbooks and concept cards.">
          <select name="color" defaultValue={COLORS.find((c) => c.value.toLowerCase() === account?.color.toLowerCase())?.value ?? account?.color ?? COLORS[3].value} className={inputClass}>
            {account && !COLORS.some((c) => c.value.toLowerCase() === account.color.toLowerCase()) && <option value={account.color}>Current colour</option>}
            {COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Row>
      </div>
      <Row label="What the account is about" hint="One line. Suki reads this as the account's editorial identity.">
        <input name="editorialIdentity" required maxLength={200} defaultValue={account?.editorialIdentity} className={inputClass} placeholder="Relatable product finds from student life" />
      </Row>
      <Row label="Audience">
        <input name="audience" required maxLength={200} defaultValue={account?.audience} className={inputClass} placeholder="Budget-conscious college students" />
      </Row>
      <Row label="Voice" hint="How the account talks.">
        <input name="voice" required maxLength={200} defaultValue={account?.voice} className={inputClass} placeholder="Casual, funny, talks like a classmate" />
      </Row>
      <Row label="Look" hint="Settings, framing and light.">
        <input name="visualDirection" required maxLength={200} defaultValue={account?.visualDirection} className={inputClass} placeholder="Dorm rooms, phone-held shots, natural light" />
      </Row>
      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Topics" hint="One per line.">
          <textarea name="pillars" required rows={4} defaultValue={list(account?.pillars)} className={inputClass} />
        </Row>
        <Row label="Formats it uses" hint="One per line.">
          <textarea name="formats" required rows={4} defaultValue={list(account?.formats)} className={inputClass} />
        </Row>
        <Row label="Audience pain points" hint="One per line. Optional.">
          <textarea name="painPoints" rows={4} defaultValue={list(account?.painPoints)} className={inputClass} />
        </Row>
        <Row label="Audience interests" hint="One per line. Optional.">
          <textarea name="interests" rows={4} defaultValue={list(account?.interests)} className={inputClass} />
        </Row>
      </div>
      <Row label="Things this account never does" hint="One per line. Optional.">
        <textarea name="restrictions" rows={3} defaultValue={list(account?.restrictions)} className={inputClass} />
      </Row>

      <ErrorNote message={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" type="submit" busy={busy === "save"} disabled={busy === "remove"}>
          {account ? "Save changes" : "Add account"}
        </Button>
        <Link href="/accounts" className="press inline-flex min-h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink">
          Cancel
        </Link>
        {account && (
          <span className="ml-auto flex items-center gap-2">
            {confirming ? (
              <>
                <span className="text-sm text-muted">Remove {account.name}?</span>
                <Button type="button" variant="danger" busy={busy === "remove"} onClick={remove}>
                  Yes, remove
                </Button>
                <Button type="button" variant="quiet" onClick={() => setConfirming(false)}>
                  Keep
                </Button>
              </>
            ) : (
              <Button type="button" variant="danger" onClick={() => setConfirming(true)} disabled={busy !== null}>
                Remove account
              </Button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
