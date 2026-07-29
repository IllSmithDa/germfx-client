/* SymptomLogList.tsx */
import * as React from "react";
import { ClipboardList } from "lucide-react";

import EditSymptomLogModal from "../EditSymptomLogModal/EditSymptomLogModal";
import type { MedOption } from "@/types";
import type { SymptomLogListItem } from "@/types/symptomLogs";
import { formatDrugName } from "@/lib/helpers/format_text";
import DeleteSymptomLogControl from "../DeleteSymptomLogControl/DeleteSymptomLogControl";

type Props = {
  logs: SymptomLogListItem[];
  recentSymptomNames?: string[];
  title?: string;
  emptyText?: string;
  compact?: boolean;
  userId: number | string;
  medOptions?: MedOption[];
};

function safeLocalDateLabelYYYYMMDD(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;

  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safeTimeLabel(iso?: string | null) {
  if (!iso) return null;

  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;

  return dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function severityTokens(sev: number): {
  strip: string;
  badgeBorder: string;
  badgeText: string;
  badgeBg: string;
  dot: string;
  label: string;
} {
  if (sev >= 7) {
    return {
      strip: "bg-rose-500",
      badgeBorder: "border-rose-400/50",
      badgeText: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-500/10",
      dot: "bg-rose-500",
      label: "Severe",
    };
  }

  if (sev >= 4) {
    return {
      strip: "bg-amber-400",
      badgeBorder: "border-amber-400/50",
      badgeText: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-500/10",
      dot: "bg-amber-400",
      label: "Moderate",
    };
  }

  return {
    strip: "bg-emerald-500",
    badgeBorder: "border-emerald-400/50",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    label: "Mild",
  };
}

function groupByDate(logs: SymptomLogListItem[]) {
  const map = new Map<string, SymptomLogListItem[]>();

  for (const log of logs) {
    const key = log.date ?? "Unknown date";
    const arr = map.get(key) ?? [];
    arr.push(log);
    map.set(key, arr);
  }

  return Array.from(map.entries());
}

const NotesIcon = () => (
  <svg
    className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="2" y="1" width="12" height="14" rx="1.5" />
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="11" x2="8" y2="11" />
  </svg>
);

const PillIcon = () => (
  <svg
    className="h-3 w-3 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M6 2h4v3l1.5 2H4.5L6 5V2z" />
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
  </svg>
);

function ContextBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 break-words text-xs leading-5 text-[hsl(var(--foreground))] sm:text-sm sm:leading-6">
        {value}
      </p>
    </div>
  );
}

export default function SymptomLogList({
  logs,
  emptyText = "Start by logging your first symptom.",
  compact = false,
  userId,
  recentSymptomNames,
  medOptions,
}: Props) {
  if (!logs?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] px-4 py-10 text-center sm:py-14">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] sm:h-12 sm:w-12">
          <ClipboardList
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          No symptom logs yet
        </p>
        <p className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
          {emptyText}
        </p>
      </div>
    );
  }

  const groups = groupByDate(logs);

  return (
    <div className="space-y-5 sm:space-y-6">
      {groups.map(([date, items]) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-2 sm:gap-3">
            <span className="min-w-0 truncate text-[11px] font-semibold text-[hsl(var(--foreground))] sm:text-xs">
              {safeLocalDateLabelYYYYMMDD(date)}
            </span>

            <span className="inline-flex shrink-0 items-center rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
              {items.length} {items.length === 1 ? "entry" : "entries"}
            </span>

            <div className="h-px min-w-8 flex-1 bg-[hsl(var(--border))]" />
          </div>

          <div className="grid gap-3">
            {items.map((log) => {
              const symptomLabel =
                log.symptom?.term?.trim() ||
                log.symptom_text?.trim() ||
                "Symptom";

              const medLabel = log.user_medication?.name?.trim() || null;
              const hasDetails = Boolean(log.details?.trim().length);
              const timeLabel = safeTimeLabel(log.created_at);
              const hasSeverity = typeof log.severity === "number";
              const tokens = hasSeverity
                ? severityTokens(log.severity as number)
                : null;
              const hasTrigger = Boolean(log.possible_trigger);
              const hasManagement = Boolean(log.management_strategy);
              const contextCount = Number(hasTrigger) + Number(hasManagement);

              return (
                <div
                  key={String(log.id)}
                  className={[
                    "relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-shadow hover:shadow-md",
                    compact ? "shadow-none" : "shadow-sm",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "absolute inset-y-0 left-0 w-1 rounded-l-2xl",
                      tokens ? tokens.strip : "bg-[hsl(var(--border))]",
                    ].join(" ")}
                  />

                  <div className="pl-5 pr-3 pt-4 sm:pr-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {hasSeverity && tokens ? (
                          <span
                            className={[
                              "inline-flex min-h-6 max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none sm:text-xs",
                              tokens.badgeBorder,
                              tokens.badgeText,
                              tokens.badgeBg,
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                                tokens.dot,
                              ].join(" ")}
                            />
                            {log.severity}/10 · {tokens.label}
                          </span>
                        ) : (
                          <span className="inline-flex min-h-6 items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))] sm:text-xs">
                            No severity
                          </span>
                        )}

                        {medLabel && (
                          <span className="inline-flex min-h-6 max-w-full items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/5 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400 sm:text-xs">
                            <PillIcon />
                            <span className="min-w-0 truncate">
                              {formatDrugName(medLabel)}
                              {log.user_medication?.nickname
                                ? ` (${formatDrugName(log.user_medication.nickname)})`
                                : ""}
                            </span>
                          </span>
                        )}

                        {compact && hasDetails ? (
                          <span
                            className="inline-block h-2 w-2 rounded-full bg-sky-400/60"
                            title="Has notes"
                          />
                        ) : null}
                      </div>

                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="min-w-0 break-words text-sm font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-base sm:leading-6">
                          {symptomLabel}
                        </span>

                        {timeLabel ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] sm:text-xs">
                            <svg
                              className="h-3 w-3 opacity-60"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <circle cx="8" cy="8" r="6" />
                              <polyline
                                points="8,5 8,8 10,10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {timeLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {hasTrigger || hasManagement ? (
                      <div
                        className={[
                          "mt-3 grid gap-2",
                          contextCount === 2
                            ? "sm:grid-cols-2"
                            : "sm:grid-cols-1",
                        ].join(" ")}
                      >
                        <ContextBlock
                          label="Possible trigger"
                          value={log.possible_trigger}
                        />

                        <ContextBlock
                          label="Management plan"
                          value={log.management_strategy}
                        />
                      </div>
                    ) : null}

                    {!compact && hasDetails ? (
                      <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5">
                        <div className="mb-1 flex items-center gap-1.5">
                          <NotesIcon />
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:text-xs">
                            Notes
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap break-words text-xs leading-5 text-[hsl(var(--foreground)/0.85)] sm:text-sm sm:leading-6">
                          {log.details}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(var(--border))] px-3 py-3 pl-5 sm:px-4 sm:pl-5">
                    <EditSymptomLogModal
                      userId={Number(userId)}
                      log={log}
                      medOptions={medOptions}
                      recentSymptomNames={recentSymptomNames}
                    />

                    <DeleteSymptomLogControl
                      symptomLogId={Number(log.id)}
                      symptomText={symptomLabel}
                      date={log.date}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}