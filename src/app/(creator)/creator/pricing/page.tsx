import { CreatorPricingForm } from "@/components/creator/creator-pricing-form";
import { getCreatorPricingView } from "@/lib/creator/server-data";

export default async function CreatorPricingPage() {
  const pricing = await getCreatorPricingView();

  return <CreatorPricingForm pricing={pricing} />;
}
