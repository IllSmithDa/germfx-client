"use client";

import Link from "next/link";
import { formatDrugName } from "@/lib/helpers/format_text";
import { hasValidUserId, LoginRequiredPanel } from "./UserHelper";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReportsSummaryResponse = {
  symptoms: {
    total_logs_last_7_days: number;
    top_symptom_name: string | null;
    top_symptom_count: number;
    avg_severity_last_7_days: number | null;
    change_vs_previous_7_days: number | null;
  };
  medications: {
    total_tracked: number;
    active_count: number;
    longest_active_name: string | null;
    longest_active_days: number | null;
    most_recent_started_name: string | null;
  };
  activity: {
    last_symptom_log_date: string | null;
    last_medication_start_date: string | null;
  };
};

type Props = {
  summary: ReportsSummaryResponse;
  userId?: number | string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateLabel(value: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function trendTokens(change: number | null) {
  if (change === null)
    return {
      strip: "bg-[hsl(var(--border))]",
      badge: "",
      badgeText: "",
      text: "No trend data available yet.",
      icon: null,
    };
  if (change > 0)
    return {
      strip: "bg-rose-500",
      badge:
        "bg-rose-500/10 border border-rose-400/40 text-rose-600 dark:text-rose-400",
      badgeText: `+${change}`,
      text: `${change} more log${change === 1 ? "" : "s"} than the previous 7 days.`,
      icon: (
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="11" x2="8" y2="5" strokeLinecap="round" />
          <polyline
            points="5,8 8,5 11,8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };
  if (change < 0)
    return {
      strip: "bg-emerald-500",
      badge:
        "bg-emerald-500/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400",
      badgeText: String(change),
      text: `${Math.abs(change)} fewer log${Math.abs(change) === 1 ? "" : "s"} than the previous 7 days.`,
      icon: (
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="5" x2="8" y2="11" strokeLinecap="round" />
          <polyline
            points="5,8 8,11 11,8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };
  return {
    strip: "bg-amber-400",
    badge:
      "bg-amber-500/10 border border-amber-400/40 text-amber-600 dark:text-amber-400",
    badgeText: "—",
    text: "Same number of logs as the previous 7 days.",
    icon: (
      <svg
        className="w-3 h-3"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="8" x2="12" y2="8" strokeLinecap="round" />
      </svg>
    ),
  };
}

function severityTokens(avg: number | null) {
  if (avg === null)
    return {
      display: "N/A",
      label: "",
      strip: "bg-[hsl(var(--muted-foreground)/0.3)]",
      badge: "",
    };
  const r = Math.round(avg * 10) / 10;
  if (avg >= 7)
    return {
      display: String(r),
      label: "Severe",
      strip: "bg-rose-500",
      badge:
        "bg-rose-500/10 border border-rose-400/40 text-rose-600 dark:text-rose-400",
    };
  if (avg >= 4)
    return {
      display: String(r),
      label: "Moderate",
      strip: "bg-amber-400",
      badge:
        "bg-amber-500/10 border border-amber-400/40 text-amber-600 dark:text-amber-400",
    };
  return {
    display: String(r),
    label: "Mild",
    strip: "bg-emerald-500",
    badge:
      "bg-emerald-500/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400",
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  accentClass = "bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500",
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentClass?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className={["h-0.5 w-full opacity-60", accentClass].join(" ")} />
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-3 py-2.5 sm:px-5 sm:py-3.5">
        {icon && (
          <span className="shrink-0 text-[hsl(var(--muted-foreground))]">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 hidden text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:block">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="px-3 py-3 sm:px-5 sm:py-4">{children}</div>
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass = "bg-[hsl(var(--muted-foreground)/0.2)]",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentClass?: string;
}) {
  // Numeric display for numbers or short strings ≤4 chars ("N/A", "3", etc.)
  const isNumeric =
    typeof value === "number" ||
    (typeof value === "string" && value.length <= 4);

  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:p-3.5">
      <div
        className={["absolute inset-x-0 top-0 h-0.5", accentClass].join(" ")}
      />
      <div className="flex items-start justify-between gap-1.5">
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {title}
        </p>
        {icon && (
          <span className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))] opacity-50">
            {icon}
          </span>
        )}
      </div>
      {isNumeric ? (
        <p className="mt-1.5 text-base font-bold tracking-tight text-[hsl(var(--foreground))] sm:mt-2 sm:text-lg">
          {value}
        </p>
      ) : (
        <p
          className="mt-1.5 min-w-0 truncate text-sm font-semibold leading-5 text-[hsl(var(--foreground))]"
          title={String(value)}
        >
          {value}
        </p>
      )}
      {subtitle && (
        <p className="mt-1 truncate text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center sm:py-10">
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        <svg
          className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="5.5" x2="8" y2="9" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <p className="text-xs font-medium text-[hsl(var(--foreground))]">
        No data yet
      </p>
      <p className="mt-0.5 max-w-[22ch] text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        {text}
      </p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const WaveIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M3 8h2l2-5 2 10 2-5h2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PillIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M6 2h4v3l1.5 2H4.5L6 5V2z" />
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <line x1="8" y1="9.5" x2="8" y2="12" strokeLinecap="round" />
    <line x1="6.5" y1="10.75" x2="9.5" y2="10.75" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="8" cy="8" r="6" />
    <polyline
      points="8,5 8,8 10.5,9.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrophyIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M5 2h6v5a3 3 0 0 1-6 0V2z" />
    <path d="M2 3h3M11 3h3" strokeLinecap="round" />
    <line x1="8" y1="10" x2="8" y2="13" strokeLinecap="round" />
    <line x1="5.5" y1="13" x2="10.5" y2="13" strokeLinecap="round" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function ReportsPanel({ summary, userId }: Props) {
  if (!hasValidUserId(userId) || !summary) {
    return (
      <LoginRequiredPanel
        title="Log in to view reports"
        description="Reports are generated from your personal medication and symptom history. Log in to view your health snapshot, trends, and medication activity."
      />
    );
  }
  const { symptoms, medications, activity } = summary;

  const hasSymptomData =
    symptoms.total_logs_last_7_days > 0 ||
    !!symptoms.top_symptom_name ||
    symptoms.avg_severity_last_7_days !== null;

  const hasMedicationData =
    medications.total_tracked > 0 ||
    medications.active_count > 0 ||
    !!medications.longest_active_name;

  const longestUsed = medications.longest_active_name
    ? formatDrugName(medications.longest_active_name)
    : "N/A";

  const mostRecent = medications.most_recent_started_name
    ? formatDrugName(medications.most_recent_started_name)
    : "N/A";

  const insight = symptoms.top_symptom_name
    ? `"${symptoms.top_symptom_name}" was your most frequently logged symptom in the last 7 days.`
    : medications.active_count > 0
      ? `You are currently tracking ${medications.active_count} active medication${medications.active_count === 1 ? "" : "s"}.`
      : "Start logging symptoms and medications to unlock insights here.";

  const trend = trendTokens(symptoms.change_vs_previous_7_days);
  const sev = severityTokens(symptoms.avg_severity_last_7_days);

  return (
    <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:space-y-5 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold leading-6 text-[hsl(var(--foreground))] sm:text-lg">
            Health Snapshot
          </h2>
          <p className="mt-0.5 hidden text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:block">
            Recent symptom trends and medication activity.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-[11px] font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] sm:px-3 sm:text-xs"
        >
          <svg
            className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="12" height="12" rx="1.5" />
            <line x1="2" y1="6" x2="14" y2="6" />
            <line x1="7" y1="6" x2="7" y2="14" />
          </svg>
          <span className="sm:hidden">Reports</span>
          <span className="hidden sm:inline">Full reports</span>
        </Link>
      </div>

      {/* Key Insight */}
      <div className="overflow-hidden rounded-2xl border border-sky-400/25 bg-sky-500/[0.06] shadow-sm">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
        <div className="flex items-start gap-2.5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-400/25 bg-sky-500/10 sm:h-8 sm:w-8">
            <svg
              className="h-3.5 w-3.5 text-sky-500 sm:h-4 sm:w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
              <circle
                cx="8"
                cy="5.5"
                r="0.5"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Key Insight
            </p>
            <p className="mt-0.5 text-sm font-medium leading-5 text-[hsl(var(--foreground))] sm:leading-6">
              {insight}
            </p>
          </div>
        </div>
      </div>

      {/* Symptoms + Medications */}
      <div className="grid gap-3 sm:gap-5 xl:grid-cols-2">
        {/* Symptoms */}
        <SectionCard
          title="Symptoms"
          description="Last 7 days"
          icon={<WaveIcon />}
          accentClass="bg-violet-500/60"
        >
          {hasSymptomData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1 xl:gap-2.5">
                <StatCard
                  title="Top Symptom"
                  value={symptoms.top_symptom_name ?? "N/A"}
                  subtitle={
                    symptoms.top_symptom_count > 0
                      ? `${symptoms.top_symptom_count} occurrence${symptoms.top_symptom_count === 1 ? "" : "s"}`
                      : undefined
                  }
                  icon={<TrophyIcon />}
                  accentClass="bg-violet-500/50"
                />

                {/* Severity — color-coded inline */}
                <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:p-3.5">
                  <div
                    className={[
                      "absolute inset-x-0 top-0 h-0.5",
                      sev.strip,
                    ].join(" ")}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Avg Severity
                  </p>
                  <p className="mt-1.5 text-base font-bold tracking-tight text-[hsl(var(--foreground))] sm:mt-2 sm:text-lg">
                    {sev.display}
                  </p>
                  {sev.label && (
                    <span
                      className={[
                        "mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        sev.badge,
                      ].join(" ")}
                    >
                      {sev.label}
                    </span>
                  )}
                </div>

                <StatCard
                  title="Total Logs"
                  value={symptoms.total_logs_last_7_days}
                  subtitle="Last 7 days"
                  icon={<WaveIcon />}
                  accentClass="bg-violet-500/50"
                />
              </div>

              {/* Weekly trend */}
              <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 sm:px-4">
                <div
                  className={[
                    "absolute inset-y-0 left-0 w-0.5 rounded-l-xl",
                    trend.strip,
                  ].join(" ")}
                />
                <div className="flex flex-col items-start gap-2 pl-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Weekly Trend
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-[hsl(var(--foreground))]">
                      {trend.text}
                    </p>
                  </div>
                  {trend.badgeText && (
                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        trend.badge,
                      ].join(" ")}
                    >
                      {trend.icon}
                      {trend.badgeText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="No symptom summary available yet." />
          )}
        </SectionCard>

        {/* Medications */}
        <SectionCard
          title="Medications"
          description="Current tracking summary"
          icon={<PillIcon />}
          accentClass="bg-sky-500/[0.06]0"
        >
          {hasMedicationData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1 xl:gap-2.5">
                <StatCard
                  title="Active"
                  value={medications.active_count}
                  subtitle="Currently active"
                  accentClass="bg-green-500/50"
                  icon={
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <polyline
                        points="5,8 7,10 11,6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
                <StatCard
                  title="Longest Used"
                  value={longestUsed}
                  subtitle={
                    medications.longest_active_days != null
                      ? `${medications.longest_active_days} day${medications.longest_active_days === 1 ? "" : "s"}`
                      : undefined
                  }
                  icon={<ClockIcon />}
                  accentClass="bg-sky-500/50"
                />
                <StatCard
                  title="Most Recent"
                  value={mostRecent}
                  subtitle="Latest start"
                  icon={<PillIcon />}
                  accentClass="bg-sky-500/50"
                />
              </div>

              {/* Medication activity */}
              <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 sm:px-4">
                <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-green-500/60" />
                <div className="pl-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Medication Activity
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-[hsl(var(--foreground))]">
                    {medications.total_tracked > 0
                      ? `${medications.total_tracked} record${medications.total_tracked === 1 ? "" : "s"} tracked · ${medications.active_count} currently active.`
                      : "No medication activity yet."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="No medication summary available yet." />
          )}
        </SectionCard>
      </div>

      {/* Recent Activity */}
      <SectionCard
        title="Recent Activity"
        description="Latest updates across your health tracking."
        icon={<ClockIcon />}
        accentClass="bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500"
      >
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {[
            {
              label: "Last Symptom Log",
              value: formatDateLabel(activity.last_symptom_log_date),
              strip: "bg-violet-500/50",
              icon: <WaveIcon />,
            },
            {
              label: "Last Medication Start",
              value: formatDateLabel(activity.last_medication_start_date),
              strip: "bg-sky-500/50",
              icon: <PillIcon />,
            },
          ].map(({ label, value, strip, icon }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:p-4"
            >
              <div
                className={["absolute inset-x-0 top-0 h-0.5", strip].join(" ")}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {icon}
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {label}
                </p>
              </div>
              <p className="mt-1.5 text-sm font-bold text-[hsl(var(--foreground))] sm:mt-2 sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}