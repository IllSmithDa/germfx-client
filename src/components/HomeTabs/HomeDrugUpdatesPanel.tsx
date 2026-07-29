"use client";

import { formatDrugName } from "@/lib/helpers/format_text";

export type DrugUpdateItem = {
  id: number;
  source: string;
  source_type: string;
  external_id: string;
  title: string;
  drug_name?: string | null;
  summary?: string | null;
  published_at?: string | null;
  severity?: string | null;
  classification?: string | null;
  status?: string | null;
  source_url?: string | null;
};

export type DrugUpdatesResponse = {
  items: DrugUpdateItem[];
  meta: {
    matched_medications?: string[];
    disclaimer?: string;
    message?: string;
  };
};

type Props = {
  updates: DrugUpdatesResponse;
};

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";

  const normalized =
    /^\d{8}$/.test(value)
      ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
      : value;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function sourceLabel(source: string, sourceType: string) {
  if (source === "FDA" && sourceType === "recall") return "FDA Recall";
  if (source === "FDA" && sourceType === "label_update") return "FDA Label";
  if (source === "FDA" && sourceType === "approval") return "FDA Update";
  return `${source} ${sourceType}`;
}

function severityClasses(severity?: string | null) {
  switch ((severity || "").toLowerCase()) {
    case "high":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30";
    case "low":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-400/30";
    default:
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/30";
  }
}

function severityLabel(severity?: string | null) {
  if (!severity) return "Info";
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export default function HomeDrugUpdatesPanel({ updates }: Props) {
  const items = updates.items ?? [];
  console.log(updates);
  const matchedMedications = updates.meta?.matched_medications ?? [];
  const message = updates.meta?.message;
  const disclaimer = updates.meta?.disclaimer;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              FDA Safety & Updates
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Official recall and label-related updates matched against your tracked medications.
            </p>
          </div>

          {items.length > 0 ? (
            <span className="inline-flex items-center self-start rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
              {items.length} update{items.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {matchedMedications.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {matchedMedications.slice(0, 8).map((med) => (
              <span
                key={med}
                className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]"
              >
                {formatDrugName ? formatDrugName(med) : med}
              </span>
            ))}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
            {message}
          </div>
        ) : null}
      </section>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={`${item.source}-${item.source_type}-${item.external_id}`}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {sourceLabel(item.source, item.source_type)}
                    </span>

                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        severityClasses(item.severity),
                      ].join(" ")}
                    >
                      {severityLabel(item.severity)}
                    </span>

                    {item.classification ? (
                      <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                        {item.classification}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-[hsl(var(--foreground))]">
                    {item.title}
                  </h3>

                  {item.drug_name ? (
                    <p className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">
                      Drug: {formatDrugName ? formatDrugName(item.drug_name) : item.drug_name}
                    </p>
                  ) : null}

                  {item.summary ? (
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                      {item.summary}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 text-sm text-[hsl(var(--muted-foreground))]">
                  {formatDate(item.published_at)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {item.status ? (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Status: {item.status}
                  </span>
                ) : null}

                {item.source_url ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted)/0.5)]"
                  >
                    Read more
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {disclaimer ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          {disclaimer}
        </div>
      ) : null}
    </div>
  );
}