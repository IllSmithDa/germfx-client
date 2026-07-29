// src/app/(marketing)/pricing/PricingDetails.tsx

import Link from "next/link";
import { Check } from "lucide-react";
import CheckoutButton from "./CheckoutButton";

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

export default function PricingDetails() {
  return (
    <section className="relative overflow-hidden px-2.5 py-10 sm:px-6 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(210 80% 50% / 0.12) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex max-w-full items-center rounded-full border border-[hsl(var(--landing-accent)/0.3)] bg-[hsl(var(--landing-accent)/0.08)] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--landing-accent))] sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-widest">
            Simple pricing
          </span>

          <h1 className="landing-display mx-auto mt-4 max-w-3xl text-[1.7rem] leading-[1.12] sm:mt-6 sm:text-4xl md:text-6xl">
            Start free. Upgrade when you need more.
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--landing-fg-muted))] sm:mt-5 sm:text-lg sm:leading-relaxed">
            SideFX is built to help you track symptoms, understand medications,
            and organize health information without complicated pricing.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-6 lg:mt-16 lg:grid-cols-2">
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
            statusLabel="Checkout is currently disabled during beta testing."
            price="$2.99"
            suffix="/ month"
            description="For deeper tracking, reports, bookmarks, and exports."
            features={plusFeatures}
            cta="Checkout disabled"
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
  statusLabel,
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
  statusLabel?: string;
  featured?: boolean;
}) {
  const buttonClassName = [
    "mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-65 sm:mt-8 sm:px-5 sm:py-3",
    featured
      ? "bg-sky-500 text-white hover:bg-sky-400 disabled:hover:bg-sky-500"
      : "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
  ].join(" ");

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur sm:rounded-3xl sm:p-8",
        featured
          ? "border-sky-400/40 bg-sky-500/10 shadow-[0_0_35px_hsl(210_80%_50%/0.18)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]/80",
      ].join(" ")}
    >
      <div className="space-y-2.5">
        {featured ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-sky-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:px-3 sm:text-xs">
              Recommended
            </span>
            <span className="inline-flex rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-300 sm:text-xs">
              Beta
            </span>
          </div>
        ) : null}

        <div>
          <h2 className="break-words text-lg font-semibold leading-snug text-[hsl(var(--foreground))] sm:text-2xl">
            {name}
          </h2>

          {statusLabel ? (
            <p className="mt-1 text-xs font-medium leading-5 text-sky-600 dark:text-sky-300 sm:text-sm">
              {statusLabel}
            </p>
          ) : null}
        </div>

        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:mt-3 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-1 gap-y-1 sm:mt-8">
        <span className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
          {price}
        </span>
        {suffix ? (
          <span className="pb-0.5 text-xs text-[hsl(var(--muted-foreground))] sm:pb-1 sm:text-sm">
            {suffix}
          </span>
        ) : null}
      </div>

      {checkoutPlan ? (
        <CheckoutButton plan={checkoutPlan} className={buttonClassName}>
          {cta}
        </CheckoutButton>
      ) : href ? (
        <Link href={href} className={buttonClassName}>
          {cta}
        </Link>
      ) : null}

      <ul className="mt-5 space-y-2 sm:mt-8 sm:space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:gap-3 sm:text-sm sm:leading-6"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:mt-1 sm:h-4 sm:w-4" />
            <span className="min-w-0">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}