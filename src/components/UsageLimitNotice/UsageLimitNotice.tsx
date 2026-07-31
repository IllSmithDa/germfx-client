import Link from "next/link";

import { CLIENT_PATHS } from "@/config/paths";

export type UsageFeatureKey =
  | "user_medications"
  | "symptom_logs"
  | "saved_items"
  | "pdf_downloads";

export type UsageLimitStatus = {
  feature_key: UsageFeatureKey | string;
  unlimited: boolean;
  should_show: boolean;
  current_count: number | null;
  limit: number | null;
  remaining: number | null;
  limit_reached: boolean;
};

type UsageLimitCopy = {
  label: string;
  usedLabel: string;
  remainingLabel: string;
  reachedMessage: string;
  normalMessage: string;
};

const USAGE_LIMIT_COPY: Record<UsageFeatureKey, UsageLimitCopy> = {
  user_medications: {
    label: "Medication tracking",
    usedLabel: "Medications used",
    remainingLabel: "medications remaining",
    normalMessage: "Free/demo accounts can track a limited number of medications.",
    reachedMessage:
      "You have reached the free/demo medication tracking limit.",
  },
  symptom_logs: {
    label: "Symptom logging",
    usedLabel: "Symptom logs used",
    remainingLabel: "symptom logs remaining",
    normalMessage: "Free/demo accounts can create a limited number of symptom logs.",
    reachedMessage:
      "You have reached the free/demo symptom log limit.",
  },
  saved_items: {
    label: "Saved news and recalls",
    usedLabel: "Saved items used",
    remainingLabel: "saved items remaining",
    normalMessage:
      "Free/demo accounts can save a limited number of news and recall items.",
    reachedMessage:
      "You have reached the free/demo saved items limit.",
  },
  pdf_downloads: {
    label: "PDF downloads",
    usedLabel: "PDF downloads used",
    remainingLabel: "PDF downloads remaining",
    normalMessage: "Free/demo accounts can download a limited number of PDFs.",
    reachedMessage:
      "You have reached the free/demo PDF download limit.",
  },
};

type Props = {
  status?: UsageLimitStatus | null;
  featureKey: UsageFeatureKey;
  className?: string;
  showUpgradeLink?: boolean;
};
export function adjustUsageLimitStatus(
  status: UsageLimitStatus | null | undefined,
  delta: number,
): UsageLimitStatus | null {
  if (!status) {
    return null;
  }

  if (!status.should_show || status.unlimited) {
    return status;
  }

  const current = Math.max(0, (status.current_count ?? 0) + delta);
  const limit = status.limit ?? 0;
  const remaining = Math.max(limit - current, 0);

  return {
    ...status,
    current_count: current,
    remaining,
    limit_reached: limit > 0 ? current >= limit : false,
  };
}
export default function UsageLimitNotice({
  status,
  featureKey,
  className = "",
  showUpgradeLink = true,
}: Props) {
  if (!status?.should_show || status.unlimited) {
    return null;
  }

  const copy = USAGE_LIMIT_COPY[featureKey];

  const current = status.current_count ?? 0;
  const limit = status.limit ?? 0;
  const remaining = status.remaining ?? 0;

  const percent =
    limit > 0 ? Math.min(Math.round((current / limit) * 100), 100) : 0;

  const isReached = status.limit_reached;

  

  return (
    <div
      className={[
        "rounded-2xl border px-2 sm:px-4 py-2 sm:py-3 text-sm shadow-sm",
        isReached
          ? "border-rose-400/30 bg-rose-500/10"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-[hsl(var(--foreground))]">
            {copy.label}
          </p>

          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {isReached ? copy.reachedMessage : copy.normalMessage}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">
          {current} / {limit}
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div
            className={[
              "h-full rounded-full transition-all",
              isReached
                ? "bg-rose-500"
                : "bg-[hsl(var(--primary))]",
            ].join(" ")}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-col gap-1 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {copy.usedLabel}:{" "}
            <span className="font-medium text-[hsl(var(--foreground))]">
              {current}
            </span>
          </span>

          <span>
            {remaining} {copy.remainingLabel}
          </span>
        </div>
      </div>

      {showUpgradeLink ? (
        <div className="mt-3">
          <Link
            href={CLIENT_PATHS.pricingPath?.() ?? "/pricing"}
            className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
          >
            Upgrade for unlimited access
          </Link>
        </div>
      ) : null}
    </div>
  );
}