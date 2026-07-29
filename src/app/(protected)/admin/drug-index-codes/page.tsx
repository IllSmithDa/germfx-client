import Link from "next/link";

import { CLIENT_PATHS } from "@/config/paths";

import {
  getAdminDrugIndexes,
} from "@/lib/server/fetchAdminDrugIndexes";
import { AdminDrugIndexKind, AdminDrugIndexSort } from "@/types/admin";
import AdminDrugIndexSortSelect from "@/components/Admin/DrugIndexes/AdminDrugIndexSortSelect";
import AdminDrugIndexSearchBar from "@/components/Admin/DrugIndexes/AdminDrugIndexSearchBar";
import AdminDrugIndexList from "@/components/Admin/DrugIndexes/AdminDrugIndexList";
import AdminDrugIndexKindFilterSelect from "@/components/Admin/DrugIndexes/AdminDrugIndexKindFilterSelect";


type PageProps = {
  searchParams?: Promise<{
    page?: string;
    page_size?: string;
    sort?: string;
    kind?: string;
  }>;
};

const DEFAULT_SORT: AdminDrugIndexSort =
  "updated_asc";


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

type KindFilterValue =
  | AdminDrugIndexKind
  | "all";

const DEFAULT_KIND: AdminDrugIndexKind =
  "brand";

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
  page,
  pageSize,
  sort,
  kind,
}: {
  page: number;
  pageSize: number;
  sort: AdminDrugIndexSort;
  kind?: AdminDrugIndexKind;
}) {
  return CLIENT_PATHS.adminDrugIndexCodesPath({
    page,
    page_size: pageSize,
    sort,
    kind,
  });
}
export default async function AdminDrugIndexCodesPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams =
    await searchParams;

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

  const result = await getAdminDrugIndexes({
    page,
    page_size: pageSize,
    sort,
    kind,
  });

  // console.log("drug indexes results: ", result)

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={CLIENT_PATHS.adminHomePath()}
              className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
            >
              ← Admin
            </Link>

            <h1 className="mt-3 text-3xl font-black">
              Drug index UPC/NDC codes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Browse existing drug index records and select a record to add
              curated UPC or NDC codes. Oldest updated records are shown first
              by default.
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
                records
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