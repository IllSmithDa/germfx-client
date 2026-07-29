import Link from "next/link";
import { redirect } from "next/navigation";

import { CLIENT_PATHS } from "@/config/paths";

import {
  searchAdminDrugIndexesByQuery,
} from "@/lib/server/fetchAdminDrugIndexes";
import { AdminDrugIndexKind, AdminDrugIndexSort } from "@/types/admin";
import AdminDrugIndexKindFilterSelect from "@/components/Admin/DrugIndexes/AdminDrugIndexKindFilterSelect";
import AdminDrugIndexSortSelect from "@/components/Admin/DrugIndexes/AdminDrugIndexSortSelect";
import AdminDrugIndexSearchBar from "@/components/Admin/DrugIndexes/AdminDrugIndexSearchBar";
import AdminDrugIndexList from "@/components/Admin/DrugIndexes/AdminDrugIndexList";



type PageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    page_size?: string;
    sort?: string;
    kind?: string;
  }>;
};

type KindFilterValue =
  | AdminDrugIndexKind
  | "all";

const DEFAULT_SORT: AdminDrugIndexSort =
  "updated_asc";

const DEFAULT_KIND: AdminDrugIndexKind =
  "brand";

function parsePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parsePageSize(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 25;
  }

  return Math.min(
    Math.max(Math.floor(parsed), 1),
    100
  );
}

function parseSort(
  value?: string
): AdminDrugIndexSort {
  const allowed: AdminDrugIndexSort[] = [
    "updated_desc",
    "updated_asc",
    "created_desc",
    "created_asc",
    "name_asc",
    "name_desc",
  ];

  if (
    value &&
    allowed.includes(
      value as AdminDrugIndexSort
    )
  ) {
    return value as AdminDrugIndexSort;
  }

  return DEFAULT_SORT;
}

function parseKind(
  value?: string
): AdminDrugIndexKind | undefined {
  const allowed: AdminDrugIndexKind[] = [
    "brand",
    "generic",
    "substance",
  ];

  if (
    value &&
    allowed.includes(
      value as AdminDrugIndexKind
    )
  ) {
    return value as AdminDrugIndexKind;
  }

  return DEFAULT_KIND;
}

function getKindFilterValue(
  kind?: AdminDrugIndexKind
): KindFilterValue {
  return kind ?? "all";
}

function pageHref({
  q,
  page,
  pageSize,
  sort,
  kind,
}: {
  q: string;
  page: number;
  pageSize: number;
  sort: AdminDrugIndexSort;
  kind?: AdminDrugIndexKind;
}) {
  return CLIENT_PATHS.adminDrugIndexCodesSearchPath({
    q,
    page,
    page_size: pageSize,
    sort,
    kind,
  });
}

export default async function AdminDrugIndexCodeSearchPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams =
    await searchParams;

  const q =
    resolvedSearchParams?.q?.trim() ?? "";

  if (!q) {
    redirect(CLIENT_PATHS.adminDrugIndexCodesPath());
  }

  const page = parsePage(
    resolvedSearchParams?.page
  );

  const pageSize = parsePageSize(
    resolvedSearchParams?.page_size
  );

  const sort = parseSort(
    resolvedSearchParams?.sort
  );

  const kind = parseKind(
    resolvedSearchParams?.kind
  );

  const result =
    await searchAdminDrugIndexesByQuery({
      q,
      page,
      page_size: pageSize,
      sort,
      kind,
      sync_openfda: true,
      openfda_limit: 100,
    });

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={CLIENT_PATHS.adminDrugIndexCodesPath()}
              className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
            >
              ← All drug indexes
            </Link>

            <h1 className="mt-3 text-3xl font-black">
              Search drug indexes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Results for{" "}
              <span className="font-bold text-[hsl(var(--foreground))]">
                &ldquo;{q}&rdquo;
              </span>
              . Brand records are shown by default because UPC curation is
              usually package/brand focused.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <AdminDrugIndexKindFilterSelect
              value={getKindFilterValue(kind)}
            />

            <AdminDrugIndexSortSelect
              value={sort}
            />
          </div>
        </div>

        <AdminDrugIndexSearchBar
          sort={sort}
          kind={kind}
          defaultValue={q}
        />

        {!result.ok ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300">
            {result.error}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-bold text-[hsl(var(--foreground))]">
                  {result.data.items.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[hsl(var(--foreground))]">
                  {result.data.pagination.total}
                </span>{" "}
                matching records
              </p>

              <p>
                Page{" "}
                <span className="font-bold text-[hsl(var(--foreground))]">
                  {result.data.pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[hsl(var(--foreground))]">
                  {result.data.pagination.total_pages || 1}
                </span>
              </p>
            </div>

            <AdminDrugIndexList
              items={result.data.items}
            />

            <div className="flex items-center justify-between gap-3">
              {result.data.pagination.has_prev ? (
                <Link
                  href={pageHref({
                    q,
                    page: page - 1,
                    pageSize,
                    sort,
                    kind,
                  })}
                  className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-bold transition hover:bg-[hsl(var(--muted))]"
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}

              {result.data.pagination.has_next ? (
                <Link
                  href={pageHref({
                    q,
                    page: page + 1,
                    pageSize,
                    sort,
                    kind,
                  })}
                  className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-bold transition hover:bg-[hsl(var(--muted))]"
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}