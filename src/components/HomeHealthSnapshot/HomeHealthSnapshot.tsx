// src/components/HomeHealthSnapshot/HomeHealthSnapshot.tsx
"use client";

import Link from "next/link";

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

type HomeHealthSnapshotProps = {
  summary: ReportsSummaryResponse;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-[hsl(var(--foreground))]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
  );
}

function formatDateLabel(value: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTrendText(change: number | null) {
  if (change === null) return "No trend data available yet.";
  if (change > 0) return `${change} more log${change === 1 ? "" : "s"} than the previous 7 days.`;
  if (change < 0) return `${Math.abs(change)} fewer log${Math.abs(change) === 1 ? "" : "s"} than the previous 7 days.`;
  return "Same number of logs as the previous 7 days.";
}

function getPrimaryInsight(summary: ReportsSummaryResponse) {
  const { symptoms, medications } = summary;

  if (symptoms.top_symptom_name && symptoms.top_symptom_count > 0) {
    return `${symptoms.top_symptom_name} was your most frequently logged symptom in the last 7 days.`;
  }

  if (medications.active_count > 0) {
    return `You are currently tracking ${medications.active_count} active medication${medications.active_count === 1 ? "" : "s"}.`;
  }

  return "Start logging symptoms and medications to unlock more insights here.";
}

export default function HomeHealthSnapshot({
  summary,
}: HomeHealthSnapshotProps) {
  const { symptoms, medications, activity } = summary;

  const hasSymptomData =
    symptoms.total_logs_last_7_days > 0 ||
    !!symptoms.top_symptom_name ||
    symptoms.avg_severity_last_7_days !== null;

  const hasMedicationData =
    medications.total_tracked > 0 ||
    medications.active_count > 0 ||
    !!medications.longest_active_name;

  const primaryInsight = getPrimaryInsight(summary);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Health Snapshot
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            A quick summary of recent symptom trends and medication activity.
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          View full reports
        </Link>
      </div>

      <SectionCard
        title="Key Insight"
        description="A quick takeaway based on your recent activity."
      >
        <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
            {primaryInsight}
          </p>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Symptoms"
          description="Based on the last 7 days of symptom logs."
        >
          {hasSymptomData ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Top Symptom"
                  value={symptoms.top_symptom_name ?? "N/A"}
                  subtitle={
                    symptoms.top_symptom_count > 0
                      ? `${symptoms.top_symptom_count} logged occurrence${symptoms.top_symptom_count === 1 ? "" : "s"}`
                      : undefined
                  }
                />

                <StatCard
                  title="Avg Severity"
                  value={
                    symptoms.avg_severity_last_7_days !== null
                      ? symptoms.avg_severity_last_7_days
                      : "N/A"
                  }
                  subtitle="Average severity over the last 7 days"
                />

                <StatCard
                  title="Recent Logs"
                  value={symptoms.total_logs_last_7_days}
                  subtitle="Symptom logs in the last 7 days"
                />
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Weekly Trend
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {getTrendText(symptoms.change_vs_previous_7_days)}
                </p>
              </div>
            </div>
          ) : (
            <EmptyLine text="No symptom summary is available yet." />
          )}
        </SectionCard>

        <SectionCard
          title="Medication Use"
          description="A quick snapshot of tracked medication activity."
        >
          {hasMedicationData ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Active Medications"
                  value={medications.active_count}
                  subtitle="Currently active medication records"
                />

                <StatCard
                  title="Longest Used"
                  value={medications.longest_active_name ?? "N/A"}
                  subtitle={
                    medications.longest_active_days !== null
                      ? `${medications.longest_active_days} day${medications.longest_active_days === 1 ? "" : "s"} tracked`
                      : "No duration data available"
                  }
                />

                <StatCard
                  title="Most Recent Start"
                  value={medications.most_recent_started_name ?? "N/A"}
                  subtitle="Most recently started medication"
                />
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Medication Activity
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {medications.total_tracked > 0
                    ? `You have tracked ${medications.total_tracked} medication record${medications.total_tracked === 1 ? "" : "s"}, with ${medications.active_count} currently active.`
                    : "No medication activity is available yet."}
                </p>
              </div>
            </div>
          ) : (
            <EmptyLine text="No medication summary is available yet." />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Activity"
        description="The latest updates across your health tracking data."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Last Symptom Log
            </p>
            <p className="mt-2 text-base font-medium text-[hsl(var(--foreground))]">
              {formatDateLabel(activity.last_symptom_log_date)}
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Last Medication Start
            </p>
            <p className="mt-2 text-base font-medium text-[hsl(var(--foreground))]">
              {formatDateLabel(activity.last_medication_start_date)}
            </p>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}