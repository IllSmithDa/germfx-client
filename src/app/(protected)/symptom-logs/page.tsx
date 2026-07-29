import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import { fetchSymptomLogsPage } from "@/lib/server/fetchSymptomLogs";
import { fetchRecentSymptomNames } from "@/lib/server/fetchRecentSymptomNames";
import { fetchUserMedications } from "@/lib/server/fetchUserMedications";
import SymptomLogList from "@/components/SymptomLogList/SymptomLogList";
import SymptomLogSortSelect from "./SymptomLogSortSelect";
import { CLIENT_PATHS } from "@/config/paths";
import type { MedOption } from "@/types";
import type { SymptomLogSort } from "@/types/symptomLogs";

const PAGE_SIZE = 10;

type Props = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    q?: string;
  }>;
};

function buildSymptomLogPageHref({
  page,
  sort,
  q,
}: {
  page: number;
  sort: SymptomLogSort;
  q?: string;
}) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (sort !== "latest") params.set("sort", sort);
  if (q) params.set("q", q);

  const qs = params.toString();
  return `/symptom-logs${qs ? `?${qs}` : ""}`;
}

export default async function SymptomLogsPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect(`/login?next=${encodeURIComponent("/symptom-logs")}`);
  }

  const resolved = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(resolved.page ?? "1") || 1);

  const sort: SymptomLogSort =
    resolved.sort === "oldest" ||
    resolved.sort === "severity_low" ||
    resolved.sort === "severity_high"
      ? resolved.sort
      : "latest";

  const q = resolved.q?.trim() ?? "";
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [response, medications, recentSymptomNames] = await Promise.all([
    fetchSymptomLogsPage({
      limit: PAGE_SIZE,
      offset,
      sort,
      q: q || undefined,
    }),
    fetchUserMedications(10),
    fetchRecentSymptomNames(10),
  ]);

  const logs = response.logs ?? [];
  const total = response.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const medOptions: MedOption[] = medications.map((med) => ({
    id: Number(med.id),
    name: med.nickname || med.name || "Medication",
  }));

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-10">
        <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Symptom Logs</h1>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Review, edit, and manage your logged symptoms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SymptomLogSortSelect value={sort} />

              <Link
                href={CLIENT_PATHS.logSymptomsPath()}
                className="inline-flex items-center rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-500/20 dark:text-violet-400"
              >
                Log symptom
              </Link>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                {total} total logs
              </span>

              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                {logs.length} shown
              </span>
            </div>

            <SymptomLogList
              logs={logs}
              userId={user.id}
              medOptions={medOptions}
              recentSymptomNames={recentSymptomNames}
              title=""
              emptyText="No symptom logs found."
            />

            <div className="mt-6 flex items-center justify-between gap-3">
              {currentPage > 1 ? (
                <Link
                  href={buildSymptomLogPageHref({
                    page: currentPage - 1,
                    sort,
                    q,
                  })}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium opacity-40">
                  ← Previous
                </span>
              )}

              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildSymptomLogPageHref({
                    page: currentPage + 1,
                    sort,
                    q,
                  })}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                >
                  Next →
                </Link>
              ) : (
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium opacity-40">
                  Next →
                </span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}