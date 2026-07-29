import Link from "next/link";
import UserMedicationList from "@/components/UserMedicationList/UserMedicationList";
import { CLIENT_PATHS } from "@/config/paths";
import MedicationSortSelect from "./MedicationSortSelect";
import { UserMedicationSort } from "@/types/userMedication";
import { fetchUserMedicationsPage } from "@/lib/server/fetchUserMedications";

const PAGE_SIZE = 10;

type Props = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    q?: string;
    active?: string;
  }>;
};

function buildMedicationPageHref({
  page,
  sort,
  q,
  active,
}: {
  page: number;
  sort: UserMedicationSort;
  q?: string;
  active?: string;
}) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (sort !== "latest") params.set("sort", sort);
  if (q) params.set("q", q);
  if (active) params.set("active", active);

  const qs = params.toString();
  return `${CLIENT_PATHS.userMedicationsPath()}${qs ? `?${qs}` : ""}`;
}

export default async function MedicationsPage({ searchParams }: Props) {

  const resolved = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(resolved.page ?? "1") || 1);

  const sort: UserMedicationSort =
    resolved.sort === "oldest" ||
    resolved.sort === "alphabetical" ||
    resolved.sort === "reverse_alphabetical"
      ? resolved.sort
      : "latest";

  const q = resolved.q?.trim() ?? "";
  const active =
    resolved.active === "true"
      ? true
      : resolved.active === "false"
        ? false
        : undefined;

  const offset = (currentPage - 1) * PAGE_SIZE;

  const response = await fetchUserMedicationsPage(
    {
    offset,
    limit: PAGE_SIZE,
    q: q || undefined,
    active,
    sort,
  });

  const medications = response.items ?? [];
  const total = response.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const activeCount = medications.filter((med) => med.is_active).length;
  const inactiveCount = medications.length - activeCount;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-10">
        <p className="flex items-start gap-1.5 px-1 text-xs text-[hsl(var(--muted-foreground))]">
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
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">My Medications</h1>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                View, edit, and manage your saved medications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <MedicationSortSelect value={sort} />

              <Link
                href={CLIENT_PATHS.drugSearchPage()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-400"
              >
                Add medication
              </Link>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                {total} total
              </span>

              <span className="rounded-full border border-green-400/40 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                {activeCount} shown active
              </span>

              {inactiveCount > 0 ? (
                <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {inactiveCount} shown inactive
                </span>
              ) : null}
            </div>

            {medications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-6 text-sm text-[hsl(var(--muted-foreground))]">
                No medications found.
              </div>
            ) : (
              <UserMedicationList medications={medications} />
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              {currentPage > 1 ? (
                <Link
                  href={buildMedicationPageHref({
                    page: currentPage - 1,
                    sort,
                    q,
                    active: resolved.active,
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
                  href={buildMedicationPageHref({
                    page: currentPage + 1,
                    sort,
                    q,
                    active: resolved.active,
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