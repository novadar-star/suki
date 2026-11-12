"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorNote, inputClass } from "@/components/button";
import { api } from "@/lib/client";
import type { Brand } from "@/lib/types";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-line pt-6">
      <legend className="float-left w-full">
        <span className="font-display text-xl font-semibold">{title}</span>
        {intro && <span className="mt-1 block text-sm text-muted">{intro}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

// Lists are typed one item per line. Rule and claim IDs follow the order of the lines.
export function BrandForm({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = (items: string[]) => items.join("\n");
  const claims = (kind: "product_fact" | "marketing_claim") => list(brand.claims.filter((c) => c.kind === kind).map((c) => c.text));
  const g = brand.guidelines;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/brand", "PATCH", Object.fromEntries(new FormData(e.currentTarget)));
      router.push("/brand");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-8">
      <Section title="Brand">
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Brand name">
            <input name="name" required maxLength={80} defaultValue={brand.name} className={inputClass} />
          </Row>
          <Row label="Industry">
            <input name="industry" required maxLength={80} defaultValue={brand.industry} className={inputClass} />
          </Row>
        </div>
        <Row label="Brand description">
          <textarea name="description" required rows={2} maxLength={400} defaultValue={brand.description} className={inputClass} />
        </Row>
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Positioning">
            <input name="positioning" required maxLength={200} defaultValue={brand.positioning} className={inputClass} />
          </Row>
          <Row label="Target market">
            <input name="targetMarket" required maxLength={200} defaultValue={brand.targetMarket} className={inputClass} />
          </Row>
        </div>
        <Row label="Tone" hint="How the brand sounds. Suki follows this in every script.">
          <input name="tone" required maxLength={200} defaultValue={brand.tone} className={inputClass} />
        </Row>
      </Section>

      <Section title="Product">
        <Row label="Product name">
          <input name="productName" required maxLength={100} defaultValue={brand.product.name} className={inputClass} />
        </Row>
        <Row label="Product description">
          <textarea name="productDescription" required rows={2} maxLength={400} defaultValue={brand.product.description} className={inputClass} />
        </Row>
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Size">
            <input name="size" required maxLength={40} defaultValue={brand.product.size} className={inputClass} />
          </Row>
          <Row label="Price">
            <input name="price" required maxLength={40} defaultValue={brand.product.price} className={inputClass} />
          </Row>
          <Row label="Key ingredients" hint="One per line. Optional.">
            <textarea name="keyIngredients" rows={4} defaultValue={list(brand.product.keyIngredients)} className={inputClass} />
          </Row>
          <Row label="How to use" hint="One step per line. Optional.">
            <textarea name="usage" rows={4} defaultValue={list(brand.product.usage)} className={inputClass} />
          </Row>
        </div>
        <Row label="Product page link" hint="Where the facts below come from. Optional.">
          <input name="sourceUrl" type="url" maxLength={300} defaultValue={brand.sourceUrl} className={inputClass} placeholder="https://" />
        </Row>
      </Section>

      <Section title="Can say" intro="Concepts may use only these. One per line; the order sets the IDs (F-01, C-01 and so on).">
        <Row label="Product facts" hint="Stated by the brand. Creative may use these as written.">
          <textarea name="facts" required rows={6} defaultValue={claims("product_fact")} className={inputClass} />
        </Row>
        <Row label="Marketing claims" hint="The brand's own wording. Creative may use these but never strengthen them.">
          <textarea name="marketingClaims" rows={5} defaultValue={claims("marketing_claim")} className={inputClass} />
        </Row>
      </Section>

      <Section title="Can't say" intro="The portfolio check blocks any concept that breaks these. One per line.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Prohibited claims" hint="A concept containing one of these phrases cannot be approved.">
            <textarea name="prohibitedClaims" rows={6} defaultValue={list(g.prohibitedClaims)} className={inputClass} />
          </Row>
          <Row label="Words to avoid">
            <textarea name="avoidWords" rows={6} defaultValue={list(g.avoidWords)} className={inputClass} />
          </Row>
          <Row label="Required disclaimers" hint="Must appear in the on-screen text of every concept.">
            <textarea name="disclaimers" rows={3} defaultValue={list(g.disclaimers)} className={inputClass} />
          </Row>
          <Row label="Restrictions" hint="Shown to reviewers and given to Suki. Not checked automatically.">
            <textarea name="restrictions" rows={3} defaultValue={list(g.restrictions)} className={inputClass} />
          </Row>
        </div>
      </Section>

      <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">
        Changing a fact or claim affects existing work: concepts that used the old wording will be flagged the next time the portfolio check runs.
      </p>
      <ErrorNote message={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" type="submit" busy={busy}>
          Save Brand Brain
        </Button>
        <Link href="/brand" className="press inline-flex min-h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
