"use client";

import type {
  AdminDrugIndexItem,
} from "@/lib/server/fetchAdminDrugIndexes";

function formatDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function kindLabel(kind: string) {
  switch (kind.toLowerCase()) {
    case "brand":
      return "Brand";
    case "generic":
      return "Generic";
    case "substance":
      return "Substance";
    default:
      return kind || "Other";
  }
}

export default function AdminDrugIndexCard({
  item,
  onManageCodes,
}: {
  item: AdminDrugIndexItem;
  onManageCodes: (
    item: AdminDrugIndexItem
  ) => void;
}) {
  const upcCount =
    item.upc_codes.length;

  const ndcCount =
    item.ndc_codes.length;

  return (
    <article className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 opacity-80" />

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-lg font-black text-[hsl(var(--foreground))]">
                {item.name}
              </h2>

              <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                {kindLabel(item.kind)}
              </span>
            </div>

            {item.manufacturer && (
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {item.manufacturer}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onManageCodes(item)
            }
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm font-bold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
          >
            Manage codes
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              UPC codes
            </p>
            <p className="mt-1 text-lg font-black">
              {upcCount}
            </p>
          </div>

          <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              NDC codes
            </p>
            <p className="mt-1 text-lg font-black">
              {ndcCount}
            </p>
          </div>

          <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Created
            </p>
            <p className="mt-1 text-sm font-bold">
              {formatDate(item.created_at)}
            </p>
          </div>

          <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Updated
            </p>
            <p className="mt-1 text-sm font-bold">
              {formatDate(item.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <span>
            ID:{" "}
            <strong className="text-[hsl(var(--foreground))]">
              {item.id}
            </strong>
          </span>

          <span>
            Source:{" "}
            <strong className="text-[hsl(var(--foreground))]">
              {item.source}
            </strong>
          </span>

          {item.latest_detail_id && (
            <span>
              Detail ID:{" "}
              <strong className="text-[hsl(var(--foreground))]">
                {item.latest_detail_id}
              </strong>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}