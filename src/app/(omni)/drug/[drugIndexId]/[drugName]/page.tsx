/* eslint-disable @typescript-eslint/no-unused-vars */
// app/drug/[drug]/page.tsx
import type { Metadata } from "next";
import { SERVER_PATHS } from "@/config/paths";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import SideEffectsPanel from "./SideEffectsPanel";
import IndicationsPanel from "./IndicationsPanel";
import DosagePanel from "./DosagePanel";
import { fetchSideEffects } from "@/lib/server/fetchSideEffects";
import { formatDrugName } from "@/lib/helpers/format_text";
import UserMedicationControls from "@/components/UserMedicationControls/UserMedicationControls";
import RawSafetyWarnings from "./RawSafetyWarnings";
import SafetyWarningsPanel from "./SafetyWarningsPanel";
import { fetchSafetyWarnings } from "@/lib/server/fetchSafetyWarning";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";
import ExportDrugDetailButton from "./ExportDrugDetailButton";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";
import UsageLimitNotice from "@/components/UsageLimitNotice/UsageLimitNotice";

export type SymptomItem = { symptom: string; definition?: string };

export type DrugInfo = {
  brand_name?: string;
  generic_name?: string;
  manufacturer?: string;
  indications?: string[];
  symptoms?: string[] | SymptomItem[];
  purpose_or_indications?: string[];
  dosage_and_administration?: string[];
  adverse_reactions?: string[];
  warnings_raw?: string | string[];
  warnings_key?: Record<string, string[] | string>;
  warnings_simple?: string[];
  updated_at?: string;
  sources?: { label: string; url: string }[];
  drug_detail_id?: string | number;
  drug_index_id?: string | number;
  symptoms_table?: string[];
};

type ContainsResponse = {
  added: boolean;
  user_medication_id?: number;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ drugName: string }>;
}): Promise<Metadata> {
  const { drugName } = await params;
  const name = decodeURIComponent(drugName);
  return { title: `${name} – Drug Details | SideFX` };
}

async function fetchFromBackend(drugIndexId: string): Promise<DrugInfo | null> {
  try {
    const url = SERVER_PATHS.getDrugByIndexId(drugIndexId);
    const r = await fetch(url, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as DrugInfo;
  } catch {
    return null;
  }
}

async function serverAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export default async function DrugDetailPage({
  params,
}: {
  params: Promise<{ drugIndexId: string; drugName: string }>;
}) {
  const { drugIndexId, drugName } = await params;
  const query = decodeURIComponent(drugName);

  const data = await fetchFromBackend(drugIndexId);
  const user = await getCurrentUser();

  const res = await fetchWithRefresh(
    SERVER_PATHS.userMedicationContains(drugIndexId),
    {
      method: "GET",
      headers: await serverAuthHeaders(),
      cache: "no-store",
    },
  );

  const userMedicationUsageStatus = user
    ? await fetchUsageLimitStatus("user_medications")
    : null;

  const pdfDownloadUsageStatus = user
    ? await fetchUsageLimitStatus("pdf_downloads")
    : null;

  const contains: ContainsResponse = res.ok
    ? (res.data as ContainsResponse)
    : { added: false };

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <svg
              className="h-7 w-7 text-[hsl(var(--muted-foreground))]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">No information found</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            We couldn&apos;t find details for &ldquo;{query}&rdquo;.
          </p>
        </div>
      </div>
    );
  }

  const sideEffectsResult = await fetchSideEffects({
    detailId: data.drug_detail_id,
    drugIndexId: data.drug_index_id,
  });

  const safetyWarningsResult = await fetchSafetyWarnings({
    detailId: data.drug_detail_id,
    drugIndexId: data.drug_index_id,
  });

  const indicationsItems = [
    ...(data.indications ?? []),
    ...(data.purpose_or_indications ?? []),
  ];

  const dosageItems = [...(data.dosage_and_administration ?? [])];

  const warningsText =
    Array.isArray(data.warnings_raw) && data.warnings_raw.length > 0
      ? data.warnings_raw.filter(
          (s) => typeof s === "string" && s.trim().length > 0,
        )
      : typeof data.warnings_raw === "string" &&
        data.warnings_raw.trim().length > 0
      ? [data.warnings_raw.trim()]
      : [];

  const displayName = formatDrugName(data?.brand_name || query);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-4xl space-y-3 px-3 py-5 sm:space-y-4 sm:px-4 sm:py-8">
        {
          /*
        <UsageLimitNotice
          featureKey="pdf_downloads"
          status={pdfDownloadUsageStatus}
        />
        */
        }
        <header className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-70" />

          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
            <div className="min-w-0">
              <h1 className="break-words text-lg font-bold capitalize leading-tight sm:text-3xl">
                {displayName}
              </h1>

              <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6" />
                  <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
                  <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
                <span>
                  Source: OpenFDA label data · Not medical advice · For personal tracking only
                </span>
              </p>

              {(data.generic_name || data.manufacturer) && (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">
                  {[data.generic_name, data.manufacturer].filter(Boolean).join(" · ")}
                </p>
              )}
              {
                /*
              <ExportDrugDetailButton
                drugDetailId={Number(data.drug_detail_id)}
                userId={user?.id}
              />
              */
              }
            </div>

            <div className="shrink-0 sm:max-w-xs">
              <UserMedicationControls
                drug_index_id={Number(data.drug_index_id)}
                drug_detail_id={Number(data.drug_detail_id)}
                user_id={user?.id || 0}
                name={drugName}
                initialAdded={contains.added}
                userMedicationUsageStatus={userMedicationUsageStatus}
              />
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 px-3 py-2.5 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:px-4 sm:py-3 sm:text-sm sm:leading-6">
          The most user-facing sections are shown first. FDA professional label details are kept below and collapsed because they can be technical, repetitive, or difficult to read out of context.
        </div>

        <SafetyWarningsPanel items={safetyWarningsResult.warnings_flat} />

        <SideEffectsPanel
          sideEffects={sideEffectsResult.side_effects}
          classified={sideEffectsResult.classified}
          classifiedDescribed={sideEffectsResult.classified_described}
        />

        <RawSafetyWarnings
          title="FDA label warnings"
          warningsText={warningsText}
          initiallyOpen={false}
        />

        <IndicationsPanel items={indicationsItems} />

        <DosagePanel items={dosageItems} />
      </div>
    </div>
  );
}