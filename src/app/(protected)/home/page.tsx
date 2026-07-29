/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  MedOption,
} from "@/types";
import HomeTabs from "@/components/HomeTabs/HomeTabs";
import { fetchUserMedications } from "@/lib/server/fetchUserMedications";
import buildUniqueMedOptions from "@/lib/helpers/buildMedOptions";
import { fetchRecentSymptomNames } from "@/lib/server/fetchRecentSymptomNames";
import { getReportsSummary } from "@/lib/server/fetchSummaryReport";
import { CLIENT_PATHS } from "@/config/paths";
import { redirect } from "next/navigation";
import { getArticlesRequest } from "@/lib/server/articlesServerApi";
import DrugSearchBar from "@/components/DrugSearchBar/DrugSearchBar";
import CodeLookupBar from "@/components/CodeLookupBar/CodeLookupBar";
import { fetchRecalls } from "@/lib/server/recallsApi";
import {
  fetchBulkSavedChecks,
  fetchBulkReactionSummaries,
} from "@/lib/server/bulkContentApi";
import { fetchSymptomLogs } from "@/lib/server/fetchSymptomLogs";
import { getSessionUser } from "@/lib/server/getSessionUserCached";


async function searchDrug(formData: FormData) {
  "use server";
  const q = String(formData.get("q") || "").trim();
  if (!q) return;
  redirect(CLIENT_PATHS.searchResultsPath(q));
}

 
export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    const next = encodeURIComponent("/home");
    redirect(`/login?next=${next}`);
  }
  const [
    summary,
    medications,
    recentSymptomNames,
    { logs, series: symptomSeries },
    articlesResponse,
    recalls,
  ] = await Promise.all([
    getReportsSummary(),
    fetchUserMedications(10),
    fetchRecentSymptomNames(10),
    fetchSymptomLogs(),
    getArticlesRequest(),
    fetchRecalls({ limit: 20, skip: 0, sync_if_needed: true }),
  ]);

  const recallIds = recalls.items.map((item) => item.id);
  const newsIds = articlesResponse.items?.map((item) => item.id) ?? [];

  const [
    recallSavedMap,
    recallReactionMap,
    newsSavedMap,
    newsReactionMap,
  ] = await Promise.all([
    fetchBulkSavedChecks("recall", recallIds),
    fetchBulkReactionSummaries("recall", recallIds),
    fetchBulkSavedChecks("news", newsIds),
    fetchBulkReactionSummaries("news", newsIds),
  ]);
  // console.log("news reaction ", newsReactionMap);
  // console.log("result: ", medications);

  const medOptions: MedOption[] = buildUniqueMedOptions(medications);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-10">
        <section>
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
              <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            For personal tracking only — not medical advice.
          </p>
          {/* ── Quick Drug Search ── */}
          <div className="mb-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold sm:text-lg">
                Search Medications
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Quickly look up side effects, warnings, and drug safety information.
              </p>
            </div>

            <DrugSearchBar
              action={searchDrug}
              placeholder="Search drugs (e.g. Tylenol, ibuprofen, lisinopril)…"
              buttonText="Search"
            />
            <CodeLookupBar />
          </div>

          <HomeTabs
            medications={medications}
            userId={user?.id ?? 0}
            logs={logs}
            recentSymptomNames={recentSymptomNames}
            medOptions={medOptions}
            reportsSummary={summary}
            articles={articlesResponse.items ?? []}
            recalls={recalls}
            recallSavedMap={recallSavedMap}
            recallReactionMap={recallReactionMap}
            newsSavedMap={newsSavedMap}
            newsReactionMap={newsReactionMap}
          />
        </section>
      </main>
    </div>
  );
}