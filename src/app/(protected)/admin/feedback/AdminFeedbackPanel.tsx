"use client";

import { deleteAdminFeedback, listAdminFeedback, updateAdminFeedbackStatus, UserFeedbackApiError } from "@/lib/client/userFeedbackApi";
import { AdminFeedbackListOut, AdminFeedbackOut, FeedbackCategory, FeedbackSort, FeedbackStatus } from "@/types/userFeedback";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const FEEDBACK_CATEGORIES: Array<{
  value: FeedbackCategory | "all";
  label: string;
}> = [
  { value: "all", label: "All categories" },
  { value: "general", label: "General" },
  { value: "bug", label: "Bug" },
  { value: "feature_request", label: "Feature request" },
  { value: "drug_data", label: "Drug data" },
  { value: "account", label: "Account" },
  { value: "reports", label: "Reports" },
  { value: "ui_ux", label: "Design / usability" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: Array<{
  value: FeedbackStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "addressed", label: "Addressed" },
];

const SORT_OPTIONS: Array<{
  value: FeedbackSort;
  label: string;
}> = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "updated_desc", label: "Recently updated" },
  { value: "rating_desc", label: "Highest rating" },
  { value: "rating_asc", label: "Lowest rating" },
];

type FilterState = {
  query: string;
  category: FeedbackCategory | "all";
  status: FeedbackStatus | "all";
  rating: number | "all";
  sort: FeedbackSort;
};

const defaultFilters: FilterState = {
  query: "",
  category: "all",
  status: "all",
  rating: "all",
  sort: "created_desc",
};

function getErrorMessage(error: unknown) {
  if (error instanceof UserFeedbackApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete feedback request.";
}

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

function formatCategory(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function normalizeStatus(value?: string | null): FeedbackStatus {
  if (value === "read" || value === "addressed") {
    return value;
  }

  return "unread";
}

function statusLabel(status: FeedbackStatus) {
  if (status === "addressed") {
    return "Addressed";
  }

  if (status === "read") {
    return "Read";
  }

  return "Unread";
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "addressed"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : status === "read"
            ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

function RatingBadge({ rating }: { rating?: number | null }) {
  if (rating == null) {
    return (
      <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
        No rating
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">
      {rating}/5
    </span>
  );
}

function PageContext({ pageUrl }: { pageUrl?: string | null }) {
  if (!pageUrl) {
    return <span>—</span>;
  }

  if (pageUrl.startsWith("/")) {
    return (
      <Link
        href={pageUrl}
        className="break-all font-medium text-sky-600 underline-offset-4 transition hover:underline dark:text-sky-400"
      >
        {pageUrl}
      </Link>
    );
  }

  return <span className="break-all">{pageUrl}</span>;
}

function FeedbackCard({
  item,
  updatingId,
  deletingId,
  onMarkStatus,
  onDeleteClick,
}: {
  item: AdminFeedbackOut;
  updatingId: number | null;
  deletingId: number | null;
  onMarkStatus: (feedbackId: number, status: FeedbackStatus) => void;
  onDeleteClick: (item: AdminFeedbackOut) => void;
}) {
  const status = normalizeStatus(item.status);
  const busy = updatingId === item.id || deletingId === item.id;

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <RatingBadge rating={item.rating} />
            <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              {formatCategory(item.category)}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {item.username ? item.username : `User #${item.user_id}`}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Submitted {formatDate(item.created_at)}
              {item.updated_at ? ` • Updated ${formatDate(item.updated_at)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status !== "read" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMarkStatus(item.id, "read")}
              className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark read
            </button>
          ) : null}

          {status !== "addressed" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMarkStatus(item.id, "addressed")}
              className="cursor-pointer rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300"
            >
              Mark addressed
            </button>
          ) : null}

          {status !== "unread" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMarkStatus(item.id, "unread")}
              className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reopen
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => onDeleteClick(item)}
            className="cursor-pointer rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground))]">
          {item.message}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 text-xs text-[hsl(var(--muted-foreground))] md:grid-cols-2">
        <div className="rounded-xl bg-[hsl(var(--muted))]/40 px-3 py-2">
          <dt className="font-semibold text-[hsl(var(--foreground))]">Page context</dt>
          <dd className="mt-1"><PageContext pageUrl={item.page_url} /></dd>
        </div>

        <div className="rounded-xl bg-[hsl(var(--muted))]/40 px-3 py-2">
          <dt className="font-semibold text-[hsl(var(--foreground))]">Device / browser</dt>
          <dd className="mt-1 break-all">{item.user_agent || "—"}</dd>
        </div>

      </dl>
    </article>
  );
}

export default function AdminFeedbackPanel() {
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminFeedbackListOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFeedbackOut | null>(null);

  const params = useMemo(
    () => ({
      page,
      page_size: 25,
      query: activeFilters.query.trim() || undefined,
      category: activeFilters.category,
      status: activeFilters.status,
      rating: activeFilters.rating,
      sort: activeFilters.sort,
    }),
    [activeFilters, page],
  );

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listAdminFeedback(params);
      setData(result);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFeedback(null);
    setActiveFilters(draftFilters);
  }

  function resetFilters() {
    setDraftFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setPage(1);
    setFeedback(null);
  }

  async function handleMarkStatus(feedbackId: number, status: FeedbackStatus) {
    setUpdatingId(feedbackId);
    setError(null);
    setFeedback(null);

    try {
      await updateAdminFeedbackStatus({ feedbackId, status });
      setFeedback(`Feedback marked ${statusLabel(status).toLowerCase()}.`);
      await loadFeedback();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    setError(null);
    setFeedback(null);

    try {
      await deleteAdminFeedback(deleteTarget.id);
      setFeedback("Feedback deleted.");
      setDeleteTarget(null);
      await loadFeedback();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={applyFilters}
        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_150px_150px_180px]">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Search
            </span>
            <input
              value={draftFilters.query}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Search message, username, page…"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Category
            </span>
            <select
              value={draftFilters.category}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  category: event.target.value as FeedbackCategory | "all",
                }))
              }
              className="w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {FEEDBACK_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Status
            </span>
            <select
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value as FeedbackStatus | "all",
                }))
              }
              className="w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Rating
            </span>
            <select
              value={String(draftFilters.rating)}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  rating:
                    event.target.value === "all"
                      ? "all"
                      : Number(event.target.value),
                }))
              }
              className="w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All ratings</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}/5
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Sort
            </span>
            <select
              value={draftFilters.sort}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  sort: event.target.value as FeedbackSort,
                }))
              }
              className="w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {SORT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold transition hover:bg-[hsl(var(--muted))]"
          >
            Reset
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
          >
            Apply filters
          </button>
        </div>
      </form>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {loading
            ? "Loading feedback…"
            : `${data?.total ?? 0} feedback item${data?.total === 1 ? "" : "s"}`}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!data?.has_next || loading}
            onClick={() => setPage((current) => current + 1)}
            className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
          Loading feedback submissions…
        </div>
      ) : data?.items.length ? (
        <div className="space-y-4">
          {data.items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              updatingId={updatingId}
              deletingId={deletingId}
              onMarkStatus={handleMarkStatus}
              onDeleteClick={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No feedback matched the current filters.
        </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cancel delete feedback"
            className="absolute inset-0 cursor-pointer bg-black/45 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />

          <section className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl">
            <h3 className="text-lg font-bold">Delete feedback?</h3>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              This permanently removes feedback #{deleteTarget.id}. This action cannot be undone.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={confirmDelete}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Deleting…" : "Delete feedback"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}