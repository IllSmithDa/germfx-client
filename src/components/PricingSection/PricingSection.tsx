// src/components/PricingSection/PricingSection.tsx

import Link from "next/link";
import { Check } from "lucide-react";
import BillingCheckoutButton from "./BillingCheckoutButton";


const freeFeatures = [
  "Medication tracking",
  "Basic symptom logging",
  "Drug search and details",
  "News and recall browsing",
  "Limited bookmarks",
  "Basic reports",
];

const plusFeatures = [
  "Unlimited symptom history",
  "Unlimited bookmarks",
  "Advanced reports",
  "PDF exports",
  "Extended health trends",
  "Future AI-assisted insights",
];

export default function PricingSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(210 80% 50% / 0.12) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--landing-accent)/0.3)] bg-[hsl(var(--landing-accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
            Simple pricing
          </span>

          <h1 className="landing-display mt-6 text-4xl leading-tight md:text-6xl">
            Start free. Upgrade when you need more.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            SideFX is built to help you track symptoms, understand medications,
            and organize health information without complicated pricing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <PricingCard
            name="Free"
            price="$0"
            description="For getting started with medication and symptom tracking."
            features={freeFeatures}
            cta="Get started"
            href="/register"
          />

          <PricingCard
            featured
            name="SideFX Plus"
            price="$2.99"
            suffix="/ month"
            description="For deeper tracking, reports, bookmarks, and exports."
            features={plusFeatures}
            cta="Subscribe"
            checkoutPlan="plus"
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  suffix,
  description,
  features,
  cta,
  href,
  checkoutPlan,
  featured = false,
}: {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  checkoutPlan?: "plus";
  featured?: boolean;
}) {
  const buttonClassName = [
    "inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-70",
    featured
      ? "bg-sky-500 text-white hover:bg-sky-400"
      : "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
  ].join(" ");

  return (
    <div
      className={[
        "relative rounded-3xl border p-8 shadow-sm backdrop-blur",
        featured
          ? "border-sky-400/40 bg-sky-500/10 shadow-[0_0_35px_hsl(210_80%_50%/0.18)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]/80",
      ].join(" ")}
    >
      {featured ? (
        <div className="absolute right-6 top-6 rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white">
          Recommended
        </div>
      ) : null}

      <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
        {name}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {description}
      </p>

      <div className="mt-8 flex items-end gap-1">
        <span className="text-5xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {price}
        </span>
        {suffix ? (
          <span className="pb-1 text-sm text-[hsl(var(--muted-foreground))]">
            {suffix}
          </span>
        ) : null}
      </div>

      {checkoutPlan ? (
        <BillingCheckoutButton
          plan={checkoutPlan}
          className={buttonClassName}
        >
          {cta}
        </BillingCheckoutButton>
      ) : href ? (
        <Link href={href} className={`mt-8 ${buttonClassName}`}>
          {cta}
        </Link>
      ) : null}

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex gap-3 text-sm text-[hsl(var(--muted-foreground))]"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}