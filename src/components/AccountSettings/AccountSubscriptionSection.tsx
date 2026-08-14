import Link from "next/link";

import { CLIENT_PATHS } from "@/config/paths";
import { CurrentUser } from "@/lib/helpers/getCurrentUser";


function formatPlanLabel(plan?: string | null) {
  switch (plan) {
    case "plus":
      return "GermFx Plus";
    case "pro":
      return "GermFx Pro";
    case "free":
    default:
      return "Free";
  }
}

function formatStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trial";
    case "canceled":
      return "Canceled";
    case "past_due":
      return "Past due";
    case "free":
    default:
      return "Free";
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AccountSubscriptionSection({
  user,
}: {
  user: CurrentUser;
}) {
  const subscription = user.subscription;

  const isPlus =
    Boolean(subscription?.is_plus) ||
    Boolean(user.is_plus);

  const plan =
    subscription?.plan ??
    user.subscription_plan ??
    "free";

  const status =
    subscription?.status ??
    user.subscription_status ??
    "free";

  const formattedPeriodEnd = formatDate(
    subscription?.current_period_end
  );

  const cancelAtPeriodEnd = Boolean(
    subscription?.cancel_at_period_end
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div
        className={[
          "h-0.5 w-full opacity-70",
          isPlus
            ? "bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500"
            : "bg-gradient-to-r from-slate-400 via-sky-500 to-violet-500",
        ].join(" ")}
      />

      <div className="border-b border-[hsl(var(--border))] px-2 sm:px-4 py-3 sm:py-4">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Subscription
        </h2>

        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          Check your current plan and access level.
        </p>
      </div>

      <div className="space-y-4 px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-black text-[hsl(var(--foreground))]">
                {formatPlanLabel(plan)}
              </p>

              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
                  isPlus
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
                ].join(" ")}
              >
                {formatStatusLabel(status)}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              {isPlus
                ? "Your account currently has access to Plus features."
                : "Your account is currently using the free plan."}
            </p>

            {isPlus && formattedPeriodEnd ? (
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {cancelAtPeriodEnd
                  ? `Access remains available until ${formattedPeriodEnd}.`
                  : `Current period ends ${formattedPeriodEnd}.`}
              </p>
            ) : null}
          </div>

          {!isPlus ? (
            <Link
              href={CLIENT_PATHS.pricingPath()}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
            >
              Upgrade to Plus!
            </Link>
          ) : (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Plus active
            </div>
          )}
        </div>

        {!isPlus ? (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Upgrade when you need more
            </p>

            <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              Plus can unlock expanded reports, exports, and future premium
              tracking features.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}