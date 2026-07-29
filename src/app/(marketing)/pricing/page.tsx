// src/app/(marketing)/pricing/page.tsx
import PricingDetails from "./PricingDetails";

export const metadata = {
  title: "Pricing – SideFX.ai",
  description: "Simple pricing for SideFX symptom tracking, reports, and exports.",
};

export default function PricingPage() {
  return (
    <div className="landing-root min-h-screen text-[hsl(var(--landing-fg))]">
      <PricingDetails />
    </div>
  );
}