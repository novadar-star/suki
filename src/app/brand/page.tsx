import { getBrand } from "@/lib/repo";
import { Field, IdList, List, PageHeader, Panel, PanelTitle, Tag } from "@/components/ui";
import { ruleId } from "@/lib/checks";

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const brand = await getBrand();
  const facts = brand.claims.filter((c) => c.kind === "product_fact");
  const marketing = brand.claims.filter((c) => c.kind === "marketing_claim");
  const g = brand.guidelines;

  return (
    <>
      <PageHeader
        title={brand.name}
        intro={
          <>
            {brand.description} Product details come from the{" "}
            <a href={brand.sourceUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
              product page
            </a>
            , checked on {new Date(brand.checkedOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="p-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.product.image} alt="" className="w-full" />
          <div className="p-5">
            <h2 className="text-xl font-semibold">{brand.product.name}</h2>
            <p className="mt-1 text-muted">{brand.product.size} · {brand.product.price}</p>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Product">{brand.product.description}</Field>
              <Field label="Positioning">{brand.positioning}</Field>
              <Field label="Target market">{brand.targetMarket}</Field>
              <Field label="Tone">{brand.tone}</Field>
            </dl>
          </Panel>
          <Panel>
            <PanelTitle>How to use</PanelTitle>
            <List items={brand.product.usage} />
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Product facts</PanelTitle>
          <p className="-mt-2 mb-3 text-sm text-muted">Stated by the brand. Creative may use these as written.</p>
          <IdList items={facts} />
        </Panel>
        <Panel>
          <PanelTitle>Marketing claims</PanelTitle>
          <p className="-mt-2 mb-3 text-sm text-muted">The brand&apos;s own wording. Creative may use these but never strengthen them.</p>
          <IdList items={marketing} />
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Guidelines</h2>
          {g.isSample && <Tag tone="warn">Sample for this demo. Replace with the brand&apos;s real guidelines.</Tag>}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Prohibited claims</h3>
            <IdList items={g.prohibitedClaims.map((text, i) => ({ id: ruleId("P", i), text }))} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Words to avoid</h3>
            <IdList items={g.avoidWords.map((text, i) => ({ id: ruleId("W", i), text }))} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Required disclaimers</h3>
            <IdList items={g.disclaimers.map((text, i) => ({ id: ruleId("D", i), text }))} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Restrictions</h3>
            <List items={g.restrictions} />
          </div>
        </div>
      </Panel>
    </>
  );
}
