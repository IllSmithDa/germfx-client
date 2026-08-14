import { UsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";


type Props = {
  status?: UsageLimitStatus | null;
  label: string;
};

export default function UsageLimitNotice({ status, label }: Props) {
  if (!status?.should_show) {
    return null;
  }

  const current = status.current_count ?? 0;
  const limit = status.limit ?? 0;
  const remaining = status.remaining ?? 0;

  return (
    <div
      className={[
        "rounded-xl border px-4 py-3 text-sm",
        status.limit_reached
          ? "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 text-[hsl(var(--muted-foreground))]",
      ].join(" ")}
    >
      <div className="font-medium text-[hsl(var(--foreground))]">
        {label}: {current} / {limit} used
      </div>

      <p className="mt-1 text-xs">
        {status.limit_reached
          ? "You have reached the free/demo limit. Upgrade to GermFx Plus for unlimited access."
          : `${remaining} remaining on the free/demo plan.`}
      </p>
    </div>
  );
}