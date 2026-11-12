import { PageHeader } from "@/components/ui";
import { aiMode } from "@/lib/ai";
import { getBrand } from "@/lib/repo";
import { BrandForm } from "./brand-form";

export const dynamic = "force-dynamic";

export default async function EditBrand() {
  const brand = await getBrand();
  return (
    <>
      <PageHeader
        title="Edit Brand Brain"
        intro={
          aiMode === "live"
            ? "Suki writes from these facts and claims, and the portfolio check enforces the rules."
            : "The portfolio check enforces these rules. Without a Gemini key, Suki's sample answers are written for the sample serum, so they will not follow a different product."
        }
      />
      <BrandForm brand={brand} />
    </>
  );
}
