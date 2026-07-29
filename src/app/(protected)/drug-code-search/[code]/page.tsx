// app/drug-code-search/[code]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import DrugSearchBar from "@/components/DrugSearchBar/DrugSearchBar";
import { CLIENT_PATHS } from "@/config/paths";
import {
  getDrugIndexByCodeRequest,
  type DrugIndexByCodeItem,
  type DrugIndexByCodeResponse,
} from "@/lib/server/fetchDrugsCodeRequest";
import CodeLookupBar from "@/components/CodeLookupBar/CodeLookupBar";
import { limitQueryText } from "@/lib/helpers/queryText";

type PageArgs = {
  params: Promise<{
    code?: string;
  }>;
  searchParams: Promise<{
    force_resync?: string;
    stale_after_days?: string;
  }>;
};

type TypeTokens = {
  label: string;
  border: string;
  text: string;
  bg: string;
};

function typeTokens(type: string): TypeTokens {
  switch (type?.toLowerCase()) {
    case "brand":
      return {
        label: "Brand",
        border: "border-sky-400/40",
        text: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-500/5",
      };

    case "generic":
      return {
        label: "Generic",
        border: "border-violet-400/40",
        text: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-500/5",
      };

    case "substance":
      return {
        label: "Substance",
        border: "border-emerald-400/40",
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/5",
      };

    default:
      return {
        label: type || "Other",
        border: "border-[hsl(var(--border))]",
        text: "text-[hsl(var(--muted-foreground))]",
        bg: "bg-[hsl(var(--muted))]",
      };
  }
}

function parseBoolean(value?: string) {
  return value === "true";
}

function parsePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function formatDrugName(value?: string | null) {
  if (!value) {
    return "Unknown medication";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function searchDrug(formData: FormData) {
  "use server";

  const q = String(formData.get("q") || "").trim();

  if (!q) {
    return;
  }

  redirect(CLIENT_PATHS.searchResultsPath(q));
}

async function fetchCodeResults(
  code: string,
  options?: {
    force_resync?: boolean;
    stale_after_days?: number;
  }
): Promise<{
  data: DrugIndexByCodeResponse | null;
  error: string | null;
}> {
  if (!code) {
    return {
      data: null,
      error: null,
    };
  }

  try {
    const data = await getDrugIndexByCodeRequest(
      code,
      {
        limit: 30,
        force_resync:
          options?.force_resync,
        stale_after_days:
          options?.stale_after_days,
      }
    );

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to search this code.",
    };
  }
}

function DrugIndexCard({
  item,
}: {
  item: DrugIndexByCodeItem;
}) {
  const tokens = typeTokens(item.kind);

  return (
    <li className="group">
      <Link
        href={CLIENT_PATHS.drugInfoPath(
          item.id,
          item.name
        )}
        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[hsl(var(--background))] focus:outline-none focus:bg-[hsl(var(--background))] transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold underline-offset-2 group-hover:underline">
              {formatDrugName(item.name)}
            </span>

            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                tokens.border,
                tokens.text,
                tokens.bg,
              ].join(" ")}
            >
              {tokens.label}
            </span>

            {item.is_stale && (
              <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Refreshed
              </span>
            )}
          </div>

          {item.manufacturer && (
            <p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">
              {item.manufacturer}
            </p>
          )}

          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Source:{" "}
            <span className="font-medium text-[hsl(var(--foreground))]">
              {item.source}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <svg
            className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline
              points="6,3 10,8 6,13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Link>
    </li>
  );
}

export async function generateMetadata(
  args: PageArgs
): Promise<Metadata> {
  const { code: seg } =
    await args.params;

  const code =
    decodeURIComponent(seg ?? "")
      .trim() || "Code Search";

  return {
    title: `Code: ${code} | SideFX`,
  };
}

export default async function DrugCodeSearchPage(
  args: PageArgs
) {
  const [
    { code: seg },
    searchParams,
  ] = await Promise.all([
    args.params,
    args.searchParams,
  ]);

  const code = limitQueryText(decodeURIComponent(seg ?? "").trim(), 25);

  const forceResync =
    parseBoolean(
      searchParams.force_resync
    );

  const staleAfterDays =
    parsePositiveNumber(
      searchParams.stale_after_days
    );

  const {
    data,
    error,
  } = await fetchCodeResults(
    code,
    {
      force_resync: forceResync,
      stale_after_days:
        staleAfterDays,
    }
  );

  const results =
    data?.items ?? [];

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
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

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              Code results for{" "}
              <span className="text-sky-500 break-all">
                &ldquo;{code || "No code"}&rdquo;
              </span>
            </h1>

            {results.length > 0 && (
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                {results.length} match
                {results.length !== 1
                  ? "es"
                  : ""}{" "}
                found
              </p>
            )}

            {data?.resync?.attempted && (
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Checked remote source
                {data.resync.resynced
                  ? " and updated local index."
                  : "."}
              </p>
            )}
          </div>

          <Link
            href={CLIENT_PATHS.drugSearchPage()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline
                points="10,3 4,8 10,13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Search
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}

        {results.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
            <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

            <ul className="divide-y divide-[hsl(var(--border))]">
              {results.map((item) => (
                <DrugIndexCard
                  key={`${item.kind}:${item.id}:${item.name}`}
                  item={item}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <svg
                className="h-5 w-5 text-[hsl(var(--muted-foreground))]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="4.5"
                />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="14"
                  y2="14"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-sm font-medium">
              No medication index found
            </p>

            <p className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
              This code did not match a saved UPC or NDC in your drug index.
              Try searching by medication name or adding a curated UPC mapping
              later.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href={CLIENT_PATHS.drugSearchPage()}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
              >
                Search by name
              </Link>

              {code && (
                <Link
                  href={`${CLIENT_PATHS.drugCodeSearchPath(
                    code
                  )}?force_resync=true`}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  Retry remote lookup
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}