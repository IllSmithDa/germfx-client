import React from "react";
import { EmptyState, SectionCard, StatCard } from "./CustomUI";
import { MedicationUsageReportItem } from "@/types";
import { formatDrugName } from "@/lib/helpers/format_text";

type Props = {
  longestMedication: MedicationUsageReportItem | null;
  activeMedicationCount: number;
  medicationUsage: MedicationUsageReportItem[];
};

// ── Timeline bars ─────────────────────────────────────────────────────────────

function MedicationTimelineBars({ items }: { items: MedicationUsageReportItem[] }) {
  if (!items.length) {
    return <EmptyState text="No medication timeline data is available yet." />;
  }

  const maxDays = Math.max(...items.map((item) => item.total_days_used ?? 0), 1);

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const label = formatDrugName(item.nickname?.trim() || item.name);
        const days = item.total_days_used ?? 0;
        const widthPercent = (days / maxDays) * 100;

        return (
          <div key={`timeline-${item.user_medication_id}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {/* Active/inactive dot */}
                <span
                  className={[
                    "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                    item.is_active ? "bg-green-500" : "bg-[hsl(var(--muted-foreground)/0.4)]",
                  ].join(" ")}
                />
                <p className="truncate text-sm font-medium">{label}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-[hsl(var(--foreground))]">
                {days} day{days === 1 ? "" : "s"}
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className={[
                  "h-full rounded-full transition-all",
                  item.is_active ? "bg-green-500/80" : "bg-sky-500/60",
                ].join(" ")}
                style={{ width: `${widthPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {item.start_date ?? "Unknown start"} → {item.end_date ?? "Present"}
            </p>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-[hsl(var(--border))]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Status
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500/80" />
          Active
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-500/60" />
          Inactive
        </span>
      </div>
    </div>
  );
}

// ── Usage table ───────────────────────────────────────────────────────────────

function MedicationUsageTable({ items }: { items: MedicationUsageReportItem[] }) {
  if (!items.length) {
    return <EmptyState text="No medication usage data is available yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {["Medication", "Start", "End", "Status", "Days"].map((h) => (
              <th
                key={h}
                className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const label = formatDrugName(item.nickname?.trim() || item.name);
            return (
              <tr
                key={item.user_medication_id}
                className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
              >
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                        item.is_active ? "bg-green-500" : "bg-[hsl(var(--muted-foreground)/0.4)]",
                      ].join(" ")}
                    />
                    <span className="font-medium">{label}</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-[hsl(var(--muted-foreground))]">
                  {item.start_date ?? "—"}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-[hsl(var(--muted-foreground))]">
                  {item.end_date ?? (
                    <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-400/40 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-3 font-semibold tabular-nums">
                  {item.total_days_used ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const PillIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2h4v3l1.5 2H4.5L6 5V2z" />
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <line x1="8" y1="9.5" x2="8" y2="12" strokeLinecap="round" />
    <line x1="6.5" y1="10.75" x2="9.5" y2="10.75" strokeLinecap="round" />
  </svg>
);

const ActiveIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <polyline points="5,8 7,10 11,6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <polyline points="8,5 8,8 10.5,9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TableIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="12" height="12" rx="1.5" />
    <line x1="2" y1="6" x2="14" y2="6" />
    <line x1="7" y1="6" x2="7" y2="14" />
  </svg>
);

const TimelineIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="2" y1="13" x2="14" y2="13" strokeLinecap="round" />
    <rect x="2" y="9" width="4" height="4" rx="0.5" />
    <rect x="2" y="5" width="7" height="4" rx="0.5" />
    <rect x="2" y="1" width="11" height="4" rx="0.5" />
  </svg>
);

// ── Panel ──────────────────────────────────────────────────────────────────────

export default function MedicationReportsPanel({
  longestMedication,
  activeMedicationCount,
  medicationUsage,
}: Props) {
  const inactiveCount = Math.max(medicationUsage.length - activeMedicationCount, 0);

  return (
    <div role="tabpanel" className="space-y-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-4 py-3 sm:py-4 shadow-sm">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {medicationUsage.length === 0
            ? "No medication reports available yet."
            : `${activeMedicationCount} active · ${inactiveCount} inactive`}
        </p>
        {longestMedication && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            <ClockIcon />
            Longest: {formatDrugName(longestMedication.nickname?.trim() || longestMedication.name)}
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Tracked Medications"
          value={medicationUsage.length}
          icon={<PillIcon />}
          accentClass="bg-sky-500/60"
        />
        <StatCard
          title="Currently Active"
          value={activeMedicationCount}
          icon={<ActiveIcon />}
          accentClass="bg-green-500/60"
        />
        <StatCard
          title="Longest Duration"
          value={
            longestMedication?.total_days_used != null
              ? `${longestMedication.total_days_used} days`
              : "N/A"
          }
          subtitle={
            longestMedication
              ? formatDrugName(longestMedication.nickname?.trim() || longestMedication.name)
              : undefined
          }
          icon={<ClockIcon />}
          accentClass="bg-sky-500/60"
        />
      </div>

      {/* Detail sections */}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Medication Duration"
          description="Start, end, status, and total days used."
          icon={<TableIcon />}
          count={medicationUsage.length}
        >
          <MedicationUsageTable items={medicationUsage} />
        </SectionCard>

        <SectionCard
          title="Usage Timeline"
          description="Relative duration of each tracked medication."
          icon={<TimelineIcon />}
        >
          <MedicationTimelineBars items={medicationUsage} />
        </SectionCard>
      </div>
    </div>
  );
}
