"use client";

import { useMemo, useState } from "react";
import SymptomReportsPanel from "./SymptomReportsPanel";
import { MedicationUsageReportItem, SymptomFrequencyReportItem } from "@/types";
import MedicationReportsPanel from "./MedicationReportsPanel";
import { Activity, Pill } from "lucide-react";
import SharedTabs, { SharedTabItem } from "../SharedTabs/SharedTabs";
import { SymptomContextReportItem } from "@/types/symptomLogs";

type ReportTabId = "symptoms" | "medications";

type ReportErrors = {
  symptomFrequency?: string;
  symptomContext?: string;
  medicationUsage?: string;
};

type ReportsTabsProps = {
  symptomFrequency: SymptomFrequencyReportItem[];
  symptomContext: SymptomContextReportItem[];
  medicationUsage: MedicationUsageReportItem[];
  errors?: ReportErrors;
};

export default function ReportsTabs({
  symptomFrequency,
  medicationUsage,
  symptomContext,
  errors
}: ReportsTabsProps) {
  const [activeTab, setActiveTab] = useState<ReportTabId>("symptoms");

  const activeMedicationCount = useMemo(
    () => medicationUsage.filter((m) => m.is_active).length,
    [medicationUsage]
  );

  function ReportErrorBanner({ message }: { message?: string }) {
    if (!message) return null;

    return (
      <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
        {message}
      </div>
    );
  }

  const longestMedication = useMemo(
    () =>
      medicationUsage.length
        ? [...medicationUsage].sort(
            (a, b) => (b.total_days_used ?? 0) - (a.total_days_used ?? 0)
          )[0]
        : null,
    [medicationUsage]
  );

  const tabs: SharedTabItem<ReportTabId>[] = [
  {
    id: "symptoms",
    label: "Symptoms",
    icon: <Activity size={15} />,
  },
  {
    id: "medications",
    label: "Medications",
    icon: <Pill size={15} />,
  },
];

  return (
    <div>
      {/* Tab bar — matches HomeTabs style */}
        <p className="my-4 flex items-start gap-1.5 px-1 text-xs text-[hsl(var(--muted-foreground))]">
          <svg
            className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
            <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          For personal tracking only — not medical advice.
        </p>
      <SharedTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Report tabs"
      />

      {activeTab === "symptoms" ? (
        <>
          <ReportErrorBanner
            message={
              errors?.symptomFrequency || errors?.symptomContext
                ? [errors?.symptomFrequency, errors?.symptomContext]
                    .filter(Boolean)
                    .join(" ")
                : undefined
            }
          />
      
          <SymptomReportsPanel
            symptomFrequency={symptomFrequency}
            symptomContext={symptomContext}
          />
        </>
      ) : null}

      {activeTab === "medications" ? (
        <>
          <ReportErrorBanner message={errors?.medicationUsage} />

          <MedicationReportsPanel
            longestMedication={longestMedication}
            medicationUsage={medicationUsage}
            activeMedicationCount={activeMedicationCount}  
          />
        </>
      ) : null}
    </div>
  );
}
