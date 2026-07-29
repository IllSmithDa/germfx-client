/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
// components/HomeTabs/HomeTabs.tsx

import { useState } from "react";
import { MedOption } from "@/types";
import { UserMedication } from "@/types/userMedication";
import SymptomLogsPanel from "./SymptomLogsPanel";
import ReportsPanel from "./ReportsPanel";
import NewsPanel from "./NewsPanel";
import RecallPanel from "./RecallPanel";
import { RecallListResponse } from "@/types/recalls";
import { ReactionSummaryMap, SavedCheckMap } from "@/lib/server/bulkContentApi";
import MedicationsPanel from "./UserMedicationsPanel";
import { NewsArticle } from "@/types/news";
import { AlertTriangle, FileText, Newspaper, Pill, WavesIcon } from "lucide-react";
import SharedTabs from "../SharedTabs/SharedTabs";
import { SymptomLogListItem } from "@/types/symptomLogs";
import { UsageLimitStatus } from "../UsageLimitNotice/UsageLimitNotice";

type ReportsSummaryResponse = {
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

type Tab = "reports" | "news" | "recalls" | "medications" | "logs";

type Props = {
  medications: UserMedication[];
  recentSymptomNames?: string[];
  userId?: number | string | null;
  logs: SymptomLogListItem[];
  medOptions?: MedOption[];
  reportsSummary: ReportsSummaryResponse;
  articles: NewsArticle[];
  recalls: RecallListResponse;
  recallSavedMap?: SavedCheckMap;
  recallReactionMap?: ReactionSummaryMap;
  newsSavedMap?: SavedCheckMap;
  newsReactionMap?: ReactionSummaryMap;
  savedItemsUsageStatus?: UsageLimitStatus | null;
};

export default function HomeTabs({
  medications,
  userId,
  logs,
  recentSymptomNames,
  medOptions,
  reportsSummary,
  articles,
  recalls,
  recallSavedMap,
  recallReactionMap,
  newsSavedMap,
  newsReactionMap,
  savedItemsUsageStatus,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("news");

  const activeMeds = medications.filter((m) => m.is_active);
  const inactiveMeds = medications.filter((m) => !m.is_active);

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
    countColor?: string;
  }[] = [
    {
      id: "news",
      label: "News",
      icon: <Newspaper size={17} />,
      count: articles.length,
      countColor:
        articles.length > 0
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/30"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent",
    },
    {
      id: "recalls",
      label: "Recalls",
      icon: <AlertTriangle size={17} />,
      count: recalls?.items?.length ?? 0,
      countColor:
        recalls?.items?.length > 0
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/30"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent",
    },
    {
      id: "medications",
      label: "Medications",
      icon: <Pill size={17} />,
      count: medications.length,
      countColor:
        activeMeds.length > 0
          ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-400/30"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent",
    },
    {
      id: "logs",
      label: "Symptom Logs",
      icon: <WavesIcon size={17} />,
      count: logs.length,
      countColor:
        "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent",
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText size={17} />,
      count:
        reportsSummary.symptoms.total_logs_last_7_days +
        reportsSummary.medications.active_count,
      countColor:
        "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/30",
    },
  ];

  return (
    <div>
      <div className="mb-4 w-full px-0 sm:px-1">
        <div className="mx-auto w-full max-w-3xl">
          <SharedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Home dashboard tabs"
            hideLabelsUntil="lg"
            hideCountsUntil="always"
          />
        </div>
      </div>

      {activeTab === "news" && (
        <NewsPanel
          articles={articles}
          savedMap={newsSavedMap}
          reactionMap={newsReactionMap}
          userId={userId}
        />
      )}

      {activeTab === "reports" && (
        <ReportsPanel summary={reportsSummary} userId={userId} />
      )}

      {activeTab === "recalls" && (
        <RecallPanel
          items={recalls?.items ?? []}
          total={recalls?.total ?? 0}
          savedMap={recallSavedMap}
          reactionMap={recallReactionMap}
          userId={userId}
        />
      )}

      {activeTab === "medications" && (
        <MedicationsPanel
          medications={medications}
          activeMeds={activeMeds}
          inactiveMeds={inactiveMeds}
        />
      )}

      {activeTab === "logs" && (
        <SymptomLogsPanel
          recentSymptomNames={recentSymptomNames}
          logs={logs}
          medOptions={medOptions}
          userId={Number(userId)}
        />
      )}
    </div>
  );
}