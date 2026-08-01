// app/drug-search-result/[query]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CLIENT_PATHS } from "@/config/paths";
import DrugSearchBar from "@/components/DrugSearchBar/DrugSearchBar";
import { redirect } from "next/navigation";
import { searchDrugRequest } from "@/lib/server/searchDrugRequest";
import CodeLookupBar from "@/components/CodeLookupBar/CodeLookupBar";
import { limitQueryText } from "@/lib/helpers/queryText";

type SearchResult = {
  name: string;
  id: string;
  type: "brand" | "generic" | "substance" | string;
  manufacturer?: string | null;
  score?: number | null;
};

type SearchResponse = {
  items: SearchResult[];
  used_fuzzy: boolean;
  did_you_mean: string | null;
};

async function fetchResults(query: string, limit = 30): Promise<SearchResponse> {
  if (!query) {
    return { items: [], used_fuzzy: false, did_you_mean: null };
  }

  return await searchDrugRequest(query, limit);
}

export async function generateMetadata(
  args: { params: Promise<{ query?: string }>; searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const [{ query: seg }, { q }] = await Promise.all([args.params, args.searchParams]);
  const qResolved = decodeURIComponent(seg ?? q ?? "").trim() || "Search";
  return { title: `Search: ${qResolved} | SideFX` };
}

async function searchDrug(formData: FormData) {
  "use server";
  const q = String(formData.get("q") || "").trim();
  if (!q) return;
  redirect(CLIENT_PATHS.searchResultsPath(q));
}

// ---- Type badge styling ----
type TypeTokens = { label: string; border: string; text: string; bg: string };

function typeTokens(type: string): TypeTokens {
  switch (type?.toLowerCase()) {
    case "brand":
      return { label: "Brand", border: "border-sky-400/40", text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/5" };
    case "generic":
      return { label: "Generic", border: "border-violet-400/40", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/5" };
    case "substance":
      return { label: "Substance", border: "border-emerald-400/40", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5" };
    default:
      return { label: type ?? "Other", border: "border-[hsl(var(--border))]", text: "text-[hsl(var(--muted-foreground))]", bg: "bg-[hsl(var(--muted)/0.5)]" };
  }
}
/*
function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-[hsl(var(--muted-foreground)/0.4)]";
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="hidden sm:block w-16 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">{pct}%</span>
    </div>
  );
}
*/
export default async function DrugSearchResultPage(
  args: { params: Promise<{ query?: string }>; searchParams: Promise<{ q?: string }> }
) {
  const [{ query: seg }, { q }] = await Promise.all([args.params, args.searchParams]);
  const query = limitQueryText(decodeURIComponent(seg ?? q ?? "").trim(), 100)

  if (!query) {
    return (
      <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
          <h1 className="text-2xl font-bold">Search</h1>
          <DrugSearchBar action={searchDrug} />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Try searching for a medicine name.</p>
        </main>
      </div>
    );
  }

  const { items: results, used_fuzzy, did_you_mean } = await fetchResults(query);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-8 space-y-2 sm:space-y-6">

        {/* Search bar */}
        <DrugSearchBar action={searchDrug} />

        {/* Code Search Bar */}
        <CodeLookupBar />

        {/* Results header */}
        <div className="flex items-center justify-between gap-3 pt-2 sm:pt-4">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              Results for{" "}
              <span className="text-sky-500 break-all" >&ldquo;{query}&rdquo;</span>
            </h1>
            {used_fuzzy && did_you_mean && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 my-4">
                Showing close matches for{" "}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
                {" "}Did you mean{" "}
                <Link
                  href={CLIENT_PATHS.searchResultsPath(did_you_mean)}
                  className="font-semibold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  {did_you_mean}
                </Link>
                ?
              </div>
            )}
            {results.length > 0 && (
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                {results.length} match{results.length !== 1 ? "es" : ""} found
              </p>
            )}
          </div>
          <div className="hidden sm:block">
            <Link
              href={CLIENT_PATHS.homePath()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="10,3 4,8 10,13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </Link>
          </div>
        </div>
        <div className="flex justify-end">
          <Link
            href={CLIENT_PATHS.homePath()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors shrink-0 align-right block sm:hidden"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10,3 4,8 10,13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Home
          </Link>
        </div>
        {/* Results list */}
        {results.length > 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

            <ul className="divide-y divide-[hsl(var(--border))]">
              {results.map((r, idx) => {
                const tokens = typeTokens(r.type);
                return (
                  <li key={`${r.type}:${r.name}:${idx}`} className="group">
                    <Link
                      href={CLIENT_PATHS.drugInfoPath(r.id, r.name)}
                      className="flex items-center justify-between gap-4 px-2 sm:px-4 py-3 sm:py-4 hover:bg-[hsl(var(--background))] focus:outline-none focus:bg-[hsl(var(--background))] transition-colors"
                    >
                      {/* Left */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold underline-offset-2 group-hover:underline truncate">
                            {r.name}
                          </span>
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                              tokens.border, tokens.text, tokens.bg,
                            ].join(" ")}
                          >
                            {tokens.label}
                          </span>
                        </div>

                        {r.manufacturer && (
                          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {r.manufacturer}
                          </p>
                        )}
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3 shrink-0">
                        <svg
                          className="w-4 h-4 text-[hsl(var(--muted-foreground))]"
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
              })}
            </ul>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-[hsl(var(--border))]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <svg className="w-5 h-5 text-[hsl(var(--muted-foreground))]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium">No results found</p>
            <p className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
              Try a different spelling — e.g. brand name{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">Advil</span> or generic{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">ibuprofen</span>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
