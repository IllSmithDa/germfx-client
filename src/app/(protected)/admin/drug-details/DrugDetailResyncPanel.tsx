"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { CLIENT_PATHS } from "@/config/paths";
import {
  listAdminDrugDetails,
  resyncDrugDetailById,
  type AdminDrugDetailOut,
  type BooleanFilter,
  type DrugDetailResyncPayload,
} from "@/lib/client/adminDrugDetailApi";
import { AdminDrugDetailSort } from "@/types/admin";

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

type PendingResync = {
  detail: AdminDrugDetailOut;
} | null;

const PAGE_SIZE = 25;

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function firstValue(values?: string[] | null) {
  return values?.find((value) => value?.trim())?.trim() ?? null;
}

function displayName(detail: AdminDrugDetailOut) {
  return (
    detail.name ||
    firstValue(detail.brand_names) ||
    firstValue(detail.generic_names) ||
    detail.index_name ||
    `Drug detail #${detail.id}`
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to complete the admin drug detail request.";
}

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function TinyBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
      {children}
    </span>
  );
}

function LatestBadge({ latest }: { latest: boolean }) {
  return (
    <span
      className={[
        "rounded-full px-2 py-0.5 text-xs font-semibold",
        latest
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      ].join(" ")}
    >
      {latest ? "Latest" : "Older"}
    </span>
  );
}

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs text-[hsl(var(--muted-foreground))]">
      {label}: <span className="font-bold text-[hsl(var(--foreground))]">{value}</span>
    </span>
  );
}

function ResultPreview({ result }: { result: DrugDetailResyncPayload | null }) {
  if (!result) {
    return null;
  }

  const payloadName =
    typeof result.payload.name === "string"
      ? result.payload.name
      : typeof result.payload.display_name === "string"
        ? result.payload.display_name
        : null;

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
      <p className="font-bold text-emerald-700 dark:text-emerald-300">
        Last resync succeeded
      </p>
      <div className="mt-2 grid gap-1 text-[hsl(var(--muted-foreground))] sm:grid-cols-2">
        <p>
          Detail ID: <span className="font-semibold text-[hsl(var(--foreground))]">{result.drug_detail_id}</span>
        </p>
        <p>
          Updated by user: <span className="font-semibold text-[hsl(var(--foreground))]">{result.updated_by_user_id}</span>
        </p>
        {payloadName ? (
          <p className="sm:col-span-2">
            Payload name: <span className="font-semibold text-[hsl(var(--foreground))]">{payloadName}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ResyncModal({
  modal,
  pending,
  onClose,
  onConfirm,
}: {
  modal: PendingResync;
  pending: boolean;
  onClose: () => void;
  onConfirm: (options: {
    drug?: string;
    makeLatest: boolean;
    resetCleanFields: boolean;
  }) => void;
}) {
  const [drug, setDrug] = useState("");
  const [makeLatest, setMakeLatest] = useState(true);
  const [resetCleanFields, setResetCleanFields] = useState(true);

  useEffect(() => {
    setDrug("");
    setMakeLatest(true);
    setResetCleanFields(true);
  }, [modal?.detail.id]);

  if (!modal) {
    return null;
  }

  const { detail } = modal;
  const title = displayName(detail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            Resync drug detail #{detail.id}?
          </h2>

          <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            This will force-refresh the selected drug detail from OpenFDA and bypass
            the normal cached-detail checks. Use this for admin cleanup and testing
            improved drug detail generation.
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-[hsl(var(--muted))]/60 p-3 text-sm">
          <p className="font-semibold">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <TinyBadge>Detail #{detail.id}</TinyBadge>
            {detail.drug_index_id ? (
              <TinyBadge>Index #{detail.drug_index_id}</TinyBadge>
            ) : null}
            {detail.source ? (
              <TinyBadge>{detail.source}</TinyBadge>
            ) : null}
            <LatestBadge latest={detail.latest_for_index} />
          </div>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold">
            Override OpenFDA search term optional
          </span>

          <input
            value={drug}
            onChange={(event) => setDrug(event.target.value)}
            placeholder={detail.query_used || title}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </label>

        <div className="mt-4 grid gap-3 rounded-xl border border-[hsl(var(--border))] p-3 text-sm">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={makeLatest}
              onChange={(event) => setMakeLatest(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold">Make latest detail</span>
              <span className="block text-[hsl(var(--muted-foreground))]">
                Set this row as the latest detail for its DrugIndex after resync.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={resetCleanFields}
              onChange={(event) => setResetCleanFields(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold">Reset generated cleaner fields</span>
              <span className="block text-[hsl(var(--muted-foreground))]">
                Clear generated warnings and side-effect fields so they can be rebuilt later.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onConfirm({
                drug: drug.trim() || undefined,
                makeLatest,
                resetCleanFields,
              })
            }
            disabled={pending}
            className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Resyncing…" : "Confirm Resync"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DrugDetailResyncPanel() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [hasWarnings, setHasWarnings] = useState<BooleanFilter>("all");
  const [hasCleanFields, setHasCleanFields] = useState<BooleanFilter>("all");
  const [sort, setSort] = useState<AdminDrugDetailSort>("updated_desc");

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminDrugDetailOut[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [modal, setModal] = useState<PendingResync>(null);
  const [lastResult, setLastResult] = useState<DrugDetailResyncPayload | null>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  async function loadDetails(nextPage = page) {
    setLoading(true);

    try {
      const result = await listAdminDrugDetails({
        query,
        source,
        hasWarnings,
        hasCleanFields,
        sort,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      setItems(result.items);
      setTotal(result.total);
      setHasNext(result.has_next);
      setPage(result.page);
    } catch (error) {
      setFeedback({
        ok: false,
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDetails(1);
    }, 250);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, source, hasWarnings, hasCleanFields, sort]);

  async function handleConfirmResync(options: {
    drug?: string;
    makeLatest: boolean;
    resetCleanFields: boolean;
  }) {
    if (!modal) {
      return;
    }

    setActionPending(true);
    setFeedback(null);
    setLastResult(null);

    try {
      const result = await resyncDrugDetailById({
        detailId: modal.detail.id,
        drug: options.drug,
        makeLatest: options.makeLatest,
        resetCleanFields: options.resetCleanFields,
      });

      setLastResult(result);
      setFeedback({
        ok: true,
        message: `${displayName(modal.detail)} was resynced successfully.`,
      });
      setModal(null);
      await loadDetails(page);
    } catch (error) {
      setFeedback({
        ok: false,
        message: getErrorMessage(error),
      });
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <Feedback state={feedback} />
      <ResultPreview result={lastResult} />

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px_160px_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Search drug details</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, query, index name, or ID"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Warnings</span>
            <select
              value={hasWarnings}
              onChange={(event) => setHasWarnings(event.target.value as BooleanFilter)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All</option>
              <option value="yes">Has warnings</option>
              <option value="no">No warnings</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Clean fields</span>
            <select
              value={hasCleanFields}
              onChange={(event) => setHasCleanFields(event.target.value as BooleanFilter)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All</option>
              <option value="yes">Generated</option>
              <option value="no">Missing</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AdminDrugDetailSort)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="updated_desc">Recently updated</option>
              <option value="created_desc">Recently created</option>
              <option value="name_asc">Name A-Z</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Source</span>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="openfda.label"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>

          <button
            type="button"
            onClick={() => void loadDetails(page)}
            disabled={loading}
            className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[hsl(var(--border))] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Drug details</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Showing {items.length} of {total} matching records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[hsl(var(--border))] text-sm">
            <thead className="bg-[hsl(var(--muted))]/60">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Drug detail</th>
                <th className="px-5 py-3 text-left font-semibold">Index</th>
                <th className="px-5 py-3 text-left font-semibold">Coverage</th>
                <th className="px-5 py-3 text-left font-semibold">Updated</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[hsl(var(--border))]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    Loading drug details…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No drug details found.
                  </td>
                </tr>
              ) : (
                items.map((detail) => (
                  <tr key={detail.id}>
                    <td className="max-w-sm px-5 py-4 align-top">
                      <div className="font-semibold">{displayName(detail)}</div>
                      <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        Detail #{detail.id}
                        {detail.query_used ? ` • Query: ${detail.query_used}` : ""}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {detail.source ? <TinyBadge>{detail.source}</TinyBadge> : null}
                        <LatestBadge latest={detail.latest_for_index} />
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-[hsl(var(--muted-foreground))]">
                      {detail.drug_index_id ? (
                        <div>
                          <div className="font-semibold text-[hsl(var(--foreground))]">
                            {detail.index_name || `Index #${detail.drug_index_id}`}
                          </div>
                          <div className="mt-1 text-xs">
                            Index #{detail.drug_index_id}
                            {detail.index_kind ? ` • ${detail.index_kind}` : ""}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        <CountPill label="Warnings" value={detail.warnings_count} />
                        <CountPill label="Simple" value={detail.warnings_simple_count} />
                        <CountPill label="Effects" value={detail.side_effects_count} />
                        <CountPill label="Indications" value={detail.indications_count} />
                        <CountPill label="Adverse" value={detail.adverse_reactions_count} />
                        <CountPill label="Dosage" value={detail.dosage_count} />
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-[hsl(var(--muted-foreground))]">
                      {formatDate(detail.updated_at || detail.created_at)}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={CLIENT_PATHS.adminDrugDetailPath(detail.id)}
                          className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold transition hover:bg-[hsl(var(--muted))]"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => setModal({ detail })}
                          className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
                        >
                          Resync
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] px-5 py-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadDetails(page - 1)}
              disabled={loading || page <= 1}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => void loadDetails(page + 1)}
              disabled={loading || !hasNext}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ResyncModal
        modal={modal}
        pending={actionPending}
        onClose={() => {
          if (!actionPending) {
            setModal(null);
          }
        }}
        onConfirm={handleConfirmResync}
      />
    </div>
  );
}