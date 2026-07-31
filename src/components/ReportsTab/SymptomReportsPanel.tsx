import { SymptomFrequencyReportItem } from "@/types";
import { EmptyState, SectionCard, StatCard } from "./CustomUI";
import { SymptomContextReportItem } from "@/types/symptomLogs";

type Props = {
  symptomFrequency: SymptomFrequencyReportItem[];
  symptomContext: SymptomContextReportItem[];
};
// Severity → color tokens (matches app-wide scale: 1-3 mild, 4-6 moderate, 7-10 severe)
function severityBarColor(avg: number | null | undefined): string {
  if (avg == null) return "bg-[hsl(var(--muted-foreground)/0.35)]";
  if (avg >= 7) return "bg-rose-500";
  if (avg >= 4) return "bg-amber-400";
  return "bg-emerald-500";
}

function severityLabel(avg: number | null | undefined): {
  text: string;
  border: string;
  textColor: string;
  bg: string;
} {
  if (avg == null)
    return {
      text: "N/A",
      border: "border-[hsl(var(--border))]",
      textColor: "text-[hsl(var(--muted-foreground))]",
      bg: "bg-[hsl(var(--muted)/0.5)]",
    };
  if (avg >= 7)
    return {
      text: `${avg} · Severe`,
      border: "border-rose-400/50",
      textColor: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
    };
  if (avg >= 4)
    return {
      text: `${avg} · Moderate`,
      border: "border-amber-400/50",
      textColor: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    };
  return {
    text: `${avg} · Mild`,
    border: "border-emerald-400/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  };
}

function TopSymptomsList({ items }: { items: SymptomFrequencyReportItem[] }) {
  if (!items.length) {
    return <EmptyState text="No symptom report data is available yet." />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const avgRounded =
          item.avg_severity != null
            ? Math.round(Number(item.avg_severity) * 10) / 10
            : null;
        const sev = severityLabel(avgRounded);
        const isTop = index === 0;

        return (
          <div
            key={`${item.symptom_text}-${index}`}
            className={[
              "flex items-center gap-3 rounded-xl border px-2 sm:px-4 py-3 sm:py-4 transition-colors",
              isTop
                ? "border-violet-400/30 bg-violet-500/5"
                : "border-[hsl(var(--border))] bg-[hsl(var(--background))]",
            ].join(" ")}
          >
            {/* Rank badge */}
            <span
              className={[
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                isTop
                  ? "bg-violet-500/20 border border-violet-400/40 text-violet-600 dark:text-violet-400"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
              ].join(" ")}
            >
              {index + 1}
            </span>

            {/* Name + severity */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.symptom_text}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    sev.border,
                    sev.textColor,
                    sev.bg,
                  ].join(" ")}
                >
                  Avg {sev.text}
                </span>
              </div>
            </div>

            {/* Count */}
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold tabular-nums leading-none">
                {item.count}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {item.count === 1 ? "log" : "logs"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SymptomFrequencyBars({ items }: { items: SymptomFrequencyReportItem[] }) {
  if (!items.length) {
    return <EmptyState text="No frequency data is available yet." />;
  }

  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const widthPercent = (item.count / maxCount) * 100;
        const avgRounded =
          item.avg_severity != null
            ? Math.round(Number(item.avg_severity) * 10) / 10
            : null;
        const barColor = severityBarColor(avgRounded);

        return (
          <div key={`${item.symptom_text}-bar-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{item.symptom_text}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-[hsl(var(--foreground))]">
                {item.count}
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className={["h-full rounded-full transition-all", barColor].join(" ")}
                style={{ width: `${widthPercent}%` }}
              />
            </div>

            {avgRounded != null && (
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                Avg severity {avgRounded}/10
              </p>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-[hsl(var(--border))]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Severity
        </span>
        {[
          { color: "bg-emerald-500", label: "Mild (1–3)" },
          { color: "bg-amber-400", label: "Moderate (4–6)" },
          { color: "bg-rose-500", label: "Severe (7–10)" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            <span className={["inline-block h-2 w-2 rounded-full", color].join(" ")} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const UniqueIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="8" strokeLinecap="round" />
    <circle cx="8" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 2h6v5a3 3 0 0 1-6 0V2z" />
    <path d="M2 3h3M11 3h3M2 3c0 2.5 1 4 3 4.5M14 3c0 2.5-1 4-3 4.5" strokeLinecap="round" />
    <line x1="8" y1="10" x2="8" y2="13" strokeLinecap="round" />
    <line x1="5.5" y1="13" x2="10.5" y2="13" strokeLinecap="round" />
  </svg>
);

const LogsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="1" width="12" height="14" rx="1.5" />
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="11" x2="8" y2="11" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="5" y1="4" x2="13" y2="4" strokeLinecap="round" />
    <line x1="5" y1="8" x2="13" y2="8" strokeLinecap="round" />
    <line x1="5" y1="12" x2="13" y2="12" strokeLinecap="round" />
    <circle cx="2.5" cy="4" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="8" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="2" y1="13" x2="14" y2="13" strokeLinecap="round" />
    <rect x="3" y="8" width="2.5" height="5" rx="0.5" />
    <rect x="6.75" y="5" width="2.5" height="8" rx="0.5" />
    <rect x="10.5" y="2" width="2.5" height="11" rx="0.5" />
  </svg>
);

function SymptomContextSection({
  items,
}: {
  items: SymptomContextReportItem[];
}) {
  if (!items.length) return null;

  return (
    <SectionCard
      title="Recent Symptom Context"
      description="Recent possible triggers and management strategies for your top logged symptoms."
      icon={<ListIcon />}
      count={items.length}
    >
      <div className="space-y-3">
        {items.map((item) => {
          const hasTriggers = item.possible_triggers.length > 0;
          const hasStrategies = item.management_strategies.length > 0;

          if (!hasTriggers && !hasStrategies) return null;

          return (
            <div
              key={item.symptom_text}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
            >
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {item.symptom_text}
              </h4>

              <div
                className={[
                  "mt-3 grid gap-3",
                  hasTriggers && hasStrategies
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-1",
                ].join(" ")}
              >
                {hasTriggers ? (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Possible triggers
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[hsl(var(--foreground))]">
                      {item.possible_triggers.map((trigger) => (
                        <li key={trigger}>• {trigger}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {hasStrategies ? (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Management strategies
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[hsl(var(--foreground))]">
                      {item.management_strategies.map((strategy) => (
                        <li key={strategy}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────

export default function SymptomReportsPanel({
  symptomFrequency,
  symptomContext,
}: Props) {
  const topSymptom = symptomFrequency[0] ?? null;
  const totalLogs = symptomFrequency.reduce((sum, item) => sum + item.count, 0);
  return (
    <div role="tabpanel" className="space-y-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-4 py-3 sm:py-4 shadow-sm">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {symptomFrequency.length === 0
            ? "No symptom reports available yet."
            : `${symptomFrequency.length} symptom group${symptomFrequency.length === 1 ? "" : "s"} · ${totalLogs} total logs`}
        </p>
        {topSymptom && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2h6v5a3 3 0 0 1-6 0V2z" />
            </svg>
            Top: {topSymptom.symptom_text}
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Unique Symptoms"
          value={symptomFrequency.length}
          icon={<UniqueIcon />}
          accentClass="bg-violet-500/60"
        />
        <StatCard
          title="Top Symptom"
          value={topSymptom?.symptom_text ?? "N/A"}
          subtitle={topSymptom ? `${topSymptom.count} logged occurrence${topSymptom.count === 1 ? "" : "s"}` : undefined}
          icon={<TrophyIcon />}
          accentClass="bg-violet-500/60"
        />
        <StatCard
          title="Total Logged Entries"
          value={totalLogs}
          icon={<LogsIcon />}
          accentClass="bg-violet-500/60"
        />
      </div>

      {/* Detail sections */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Top Symptoms"
          description="Most frequently logged, with average severity."
          icon={<ListIcon />}
          count={symptomFrequency.length}
        >
          <TopSymptomsList items={symptomFrequency} />
        </SectionCard>

        <SectionCard
          title="Frequency Overview"
          description="Bar length = log count · color = avg severity."
          icon={<ChartIcon />}
        >
          <SymptomFrequencyBars items={symptomFrequency} />
        </SectionCard>
      </div>
      <SymptomContextSection items={symptomContext} />
    </div>
  );
}
