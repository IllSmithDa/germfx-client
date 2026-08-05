/* eslint-disable @typescript-eslint/no-unused-vars */

import type { MedOption } from "@/types";

import HomeTabs from "@/components/HomeTabs/HomeTabs";
import NavbarAuth from "@/components/Navbar/NavbarAuth";
import NavbarNoAuth from "@/components/Navbar/NavbarNoAuth";
import DrugSearchBar from "@/components/DrugSearchBar/DrugSearchBar";
import CodeLookupBar from "@/components/CodeLookupBar/CodeLookupBar";

import { CLIENT_PATHS } from "@/config/paths";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/server/getSessionUserCached";
import { getArticlesRequest } from "@/lib/server/articlesServerApi";
import { fetchRecalls } from "@/lib/server/recallsApi";

import { fetchUserMedications } from "@/lib/server/fetchUserMedications";
import buildUniqueMedOptions from "@/lib/helpers/buildMedOptions";
import { fetchRecentSymptomNames } from "@/lib/server/fetchRecentSymptomNames";
import { getReportsSummary } from "@/lib/server/fetchSummaryReport";
import { fetchSymptomLogs } from "@/lib/server/fetchSymptomLogs";

import {
  fetchBulkSavedChecks,
  fetchBulkReactionSummaries,
} from "@/lib/server/bulkContentApi";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";
import Footer from "@/components/Footer/Footer";

type ReportsSummary = Awaited<ReturnType<typeof getReportsSummary>>;
type SymptomLogsResult = Awaited<ReturnType<typeof fetchSymptomLogs>>;
type UserMedications = Awaited<ReturnType<typeof fetchUserMedications>>;
type RecentSymptomNames = Awaited<ReturnType<typeof fetchRecentSymptomNames>>;

const EMPTY_REPORTS_SUMMARY = {
  symptoms: {
    total_logs_last_7_days: 0,
  },
  medications: {
    active_count: 0,
  },
} as ReportsSummary;

const EMPTY_SYMPTOM_LOGS = {
  logs: [],
  series: [],
} as SymptomLogsResult;

function hasValidUserId(userId?: number | string | null) {
  if (userId === null || userId === undefined) {
    return false;
  }

  return String(userId).trim().length > 0;
}

export default async function Home() {
  const user = await getSessionUser();

  const userId = user?.id ?? null;
  const isLoggedIn = hasValidUserId(userId);

  const [articlesResponse, recalls] = await Promise.all([
    getArticlesRequest(),
    fetchRecalls({
      limit: 20,
      skip: 0,
      sync_if_needed: true,
    }),
  ]);

  let summary: ReportsSummary = EMPTY_REPORTS_SUMMARY;
  let medications: UserMedications = [] as UserMedications;
  let recentSymptomNames: RecentSymptomNames = [] as RecentSymptomNames;
  let symptomLogsResult: SymptomLogsResult = EMPTY_SYMPTOM_LOGS;

  let recallSavedMap = {};
  let recallReactionMap = {};
  let newsSavedMap = {};
  let newsReactionMap = {};

  if (isLoggedIn) {
    [
      summary,
      medications,
      recentSymptomNames,
      symptomLogsResult,
    ] = await Promise.all([
      getReportsSummary(),
      fetchUserMedications(10),
      fetchRecentSymptomNames(10),
      fetchSymptomLogs(),
    ]);

    const recallIds = recalls.items.map((item) => item.id);
    const newsIds = articlesResponse.items?.map((item) => item.id) ?? [];

    [
      recallSavedMap,
      recallReactionMap,
      newsSavedMap,
      newsReactionMap,
    ] = await Promise.all([
      recallIds.length > 0
        ? fetchBulkSavedChecks("recall", recallIds)
        : Promise.resolve({}),

      recallIds.length > 0
        ? fetchBulkReactionSummaries("recall", recallIds)
        : Promise.resolve({}),

      newsIds.length > 0
        ? fetchBulkSavedChecks("news", newsIds)
        : Promise.resolve({}),

      newsIds.length > 0
        ? fetchBulkReactionSummaries("news", newsIds)
        : Promise.resolve({}),
    ]);
  }

  const medOptions: MedOption[] = isLoggedIn
    ? buildUniqueMedOptions(medications)
    : [];
  const savedItemsUsageStatus = user
    ? await fetchUsageLimitStatus("saved_items")
    : null;
  
  return (
    <>
      {isLoggedIn && user ? <NavbarAuth user={user} /> : <NavbarNoAuth />}

      <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <main className="mx-auto max-w-5xl px-2 py-2 sm:px-5 sm:py-5 space-y-4 md:space-y-8 md:py-10">
          <section>
            <div className="hidden md:block">
              <p className="mb-3 flex items-start gap-1.5 px-1 text-xs text-[hsl(var(--muted-foreground))]">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
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
                For personal tracking only — not medical advice.
              </p>
            </div>

            <HomeTabs
              medications={medications}
              userId={userId}
              logs={symptomLogsResult.logs}
              recentSymptomNames={recentSymptomNames}
              medOptions={medOptions}
              reportsSummary={summary}
              articles={articlesResponse.items ?? []}
              recalls={recalls}
              recallSavedMap={recallSavedMap}
              recallReactionMap={recallReactionMap}
              newsSavedMap={newsSavedMap}
              newsReactionMap={newsReactionMap}
              savedItemsUsageStatus={savedItemsUsageStatus}
            />
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}