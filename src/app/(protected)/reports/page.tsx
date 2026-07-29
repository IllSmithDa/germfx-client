// src/app/(protected)/reports/page.tsx

import { redirect } from "next/navigation";


import ReportsTabs from "@/components/ReportsTab/RerportsTab";
import UsageLimitNotice from "@/components/UsageLimitNotice/UsageLimitNotice";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import {
  getMedicationUsageReport,
  getSymptomContextReport,
  getSymptomFrequencyReport,
} from "@/lib/server/fetchReports";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";
import { fetchUserSettings } from "@/lib/server/fetchUserSettings";
import DownloadReportPdfButton from "./DownloadReportPdfButton";

export const dynamic = "force-dynamic";

function reportRangeToDays(range?: string) {
  switch (range) {
    case "7d":
      return 7;
    case "90d":
      return 90;
    case "30d":
      return 30;
    case "all":
      return 365;
    default:
      return 30;
  }
}

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const settings = await fetchUserSettings();
  const symptomLimit = settings.top_symptom_limit ?? 10;
  const reportRange = settings.default_report_range ?? "30d";
  const days = reportRangeToDays(reportRange);

  const [
    pdfDownloadUsageStatus,
    symptomFrequencyResult,
    symptomContextResult,
    medicationUsageResult,
  ] = await Promise.all([
    fetchUsageLimitStatus("pdf_downloads"),
    getSymptomFrequencyReport({
      limit: symptomLimit,
      range: reportRange,
    }),
    getSymptomContextReport({
      limit: symptomLimit,
      context_limit: 3,
      range: reportRange,
    }),
    getMedicationUsageReport({
      range: reportRange,
    }),
  ]);

  const symptomFrequency = symptomFrequencyResult.data;
  const symptomContext = symptomContextResult.data;
  const medicationUsage = medicationUsageResult.data;

  return (
    <div className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-8">
      <UsageLimitNotice
        featureKey="pdf_downloads"
        status={pdfDownloadUsageStatus}
      />

      <div className="mb-5 mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Review symptom patterns and medication history over time.
          </p>
          <p className="mb-1 text-xs text-[hsl(var(--muted-foreground))]">
            Current default range: {reportRange}
          </p>
          <p className="mb-1 text-xs text-[hsl(var(--muted-foreground))]">
            Current top symptoms limit: {symptomLimit}
          </p>
          <p className="mb-1 text-xs text-[hsl(var(--muted-foreground))]">
            (Edit these values in settings)
          </p>
        </div>

        <DownloadReportPdfButton
          userId={user.id}
          days={days}
          topSymptomLimit={symptomLimit}
          limitReached={
            pdfDownloadUsageStatus?.limit_reached ?? false
          }
        />
      </div>

      <ReportsTabs
        symptomFrequency={symptomFrequency}
        symptomContext={symptomContext}
        medicationUsage={medicationUsage}
        errors={{
          symptomFrequency: symptomFrequencyResult.error,
          symptomContext: symptomContextResult.error,
          medicationUsage: medicationUsageResult.error,
        }}
      />
    </div>
  );
}