import { RecallSort } from "@/types/recalls";
import Link from "next/link";

function buildRecallPageHref(
  page: number,
  query?: string,
  source?: string,
  state ?: string,
  view?: "all" | "saved",
  sort ?: RecallSort,
) {
  const params = new URLSearchParams();
  
  if (page > 1) params.set("page", String(page));
  if (query) params.set("query", query);
  if (source) params.set("source", source);
  if (view && view !== "all") params.set("view", view);
  if (state && state !== "all") params.set("state", state);
  if (sort && sort !== "latest") params.set("sort", sort);
  const qs = params.toString();
  return `/recalls${qs ? `?${qs}` : ""}`;
}

export default function RecallPagination({
  currentPage,
  totalPages,
  query,
  source,
  state = "all",
  view = "all",
  sort = "latest",
}: {
  currentPage: number;
  totalPages: number;
  query?: string;
  source?: string;
  state ?: string;
  view?: "all" | "saved";
  sort?: RecallSort;
}) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-sm">
      <Link
        href={buildRecallPageHref(Math.max(1, currentPage - 1), query, source, state, view, sort)}
        className={[
          "rounded-lg px-3 py-1.5 text-sm font-medium",
          currentPage <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-[hsl(var(--muted))]",
        ].join(" ")}
      >
        Previous
      </Link>

      <span className="text-sm text-[hsl(var(--muted-foreground))]">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={buildRecallPageHref(
          Math.min(totalPages, currentPage + 1),
          query,
          source,
          state,
          view,
          sort
        )}
        className={[
          "rounded-lg px-3 py-1.5 text-sm font-medium",
          currentPage >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-[hsl(var(--muted))]",
        ].join(" ")}
      >
        Next
      </Link>
    </div>
  );
}