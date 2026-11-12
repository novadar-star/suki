import { getBrand } from "@/lib/repo";
import { NewCampaignForm } from "./new-campaign-form";

export const dynamic = "force-dynamic";

export default async function NewCampaign() {
  const brand = await getBrand();
  return <NewCampaignForm product={`${brand.name} ${brand.product.name}`} />;
}
