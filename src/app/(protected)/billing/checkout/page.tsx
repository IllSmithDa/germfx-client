import { Suspense } from "react";
import PaddleCheckoutClient from "./PaddleCheckoutClient";


export const metadata = {
  title: "Checkout – GermFx",
  description: "Complete your GermFx Plus checkout.",
};

export default function BillingCheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <PaddleCheckoutClient />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-6 py-16 text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-500">
          GermFx Plus
        </p>
        <h1 className="mt-2 text-3xl font-bold">Preparing checkout</h1>
        <p className="mt-3 text-[hsl(var(--muted-foreground))]">
          Loading your Paddle transaction...
        </p>
      </div>
    </main>
  );
}