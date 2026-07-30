import React from "react";
import Link from "next/link";

import SymptomLogList from "../SymptomLogList/SymptomLogList";
import { MedOption } from "@/types";
import { CLIENT_PATHS } from "@/config/paths";
import { SymptomLogListItem } from "@/types/symptomLogs";

type Props = {
  recentSymptomNames?: string[];
  logs: SymptomLogListItem[];
  medOptions?: MedOption[];
  userId: number;
};

export default function SymptomLogsPanel({
  recentSymptomNames,
  logs,
  medOptions,
  userId,
}: Props) {
  const dayCount = new Set(logs.map((log) => log.date)).size;

  const summaryText =
    logs.length === 0
      ? "No symptoms logged yet."
      : `${logs.length} ${logs.length === 1 ? "entry" : "entries"} across ${dayCount} ${dayCount === 1 ? "day" : "days"}`;

  return (
    <div
      role="tabpanel"
      className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:p-5"
    >
      <h2 className="truncate text-base font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-lg sm:leading-6">
        My Symptoms
      </h2>
      <div className="mb-4 space-y-3 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:space-y-0">
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/35 px-3 py-2 text-center text-xs font-medium text-[hsl(var(--muted-foreground))] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:text-sm">
          {summaryText}
        </p>
    
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Link
            href={CLIENT_PATHS.symptomLogsPath()}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] sm:min-h-0 sm:py-1.5"
          >
            View all
          </Link>

          <Link
            href={CLIENT_PATHS.logSymptomsPath()}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-violet-400 sm:min-h-0 sm:py-1.5"
          >
            <span className="sm:hidden">Log symptom</span>
            <span className="hidden sm:inline">Log a symptom</span>
          </Link>
        </div>
      </div>

      <SymptomLogList
        recentSymptomNames={recentSymptomNames}
        logs={logs}
        title=""
        userId={Number(userId)}
        medOptions={medOptions}
      />
    </div>
  );
}