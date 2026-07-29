import { SavedItemsSort } from "@/types";
import Link from "next/link";


type ExtraParams = Record<string, string | number | boolean | null | undefined>;

export default function SavedItemPagination({
  baseUrl,
  currentPage,
  totalPages,
  query,
  sort,
  pageParam,
  queryParam = "query",
  sortParam,
  extraParams,
}: {
  baseUrl: string;
  currentPage: number;
  totalPages: number;
  query?: string;
  sort?: SavedItemsSort;
  pageParam: string;
  queryParam?: string;
  sortParam: string;
  extraParams?: ExtraParams;
}) {
  function buildHref(page: number) {
    const params = new URLSearchParams();

    if (page > 1) params.set(pageParam, String(page));
    if (query) params.set(queryParam, query);
    if (sort && sort !== "newest") params.set(sortParam, sort);

    Object.entries(extraParams ?? {}).forEach(([key, value]) => {
      if (value == null || value === "" || value === false) return;
      params.set(key, String(value));
    });
    
    const qs = params.toString();
    console.log(`${baseUrl}${qs ? `?${qs}` : ""}`)
    return `${baseUrl}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
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
          href={buildHref(currentPage + 1)}
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
  );
}