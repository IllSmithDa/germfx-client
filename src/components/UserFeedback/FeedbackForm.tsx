"use client";

import { useEffect, useMemo, useState } from "react";

import {
  submitUserFeedback,
  UserFeedbackApiError,
} from "@/lib/client/userFeedbackApi";
import { FeedbackCategory, SubmitFeedbackPayload, UserFeedbackOut } from "@/types/userFeedback";

const MAX_MESSAGE_LENGTH = 5000;

const FEEDBACK_CATEGORIES: Array<{
  value: FeedbackCategory;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General feedback",
    description: "Share a thought, suggestion, or overall impression.",
  },
  {
    value: "bug",
    label: "Bug report",
    description: "Something is broken, confusing, or not working as expected.",
  },
  {
    value: "feature_request",
    label: "Feature request",
    description: "Suggest a new feature or workflow improvement.",
  },
  {
    value: "drug_data",
    label: "Drug data",
    description: "Report confusing, incomplete, or incorrect medication details.",
  },
  {
    value: "account",
    label: "Account",
    description: "Feedback about login, email verification, settings, or billing.",
  },
  {
    value: "reports",
    label: "Reports",
    description: "Feedback about symptom, medication, or summary reports.",
  },
  {
    value: "ui_ux",
    label: "Design / usability",
    description: "Feedback about layout, navigation, readability, or mobile use.",
  },
  {
    value: "performance",
    label: "Performance",
    description: "Report slow pages, loading problems, or responsiveness issues.",
  },
  {
    value: "other",
    label: "Other",
    description: "Anything that does not fit the categories above.",
  },
];

function getCurrentPageUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function normalizeMessage(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof UserFeedbackApiError) {
    if (error.status === 401) {
      return "Please log in before submitting feedback.";
    }

    if (
      error.status === 403 ||
      error.code === "EMAIL_VERIFICATION_REQUIRED"
    ) {
      return "Please verify your email before submitting feedback.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to submit feedback right now.";
}

function StarButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Set rating to ${value}`}
      onClick={onClick}
      className={[
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-bold transition disabled:cursor-not-allowed",
        selected
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]",
      ].join(" ")}
    >
      {value}
    </button>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  );
}

function SubmissionSuccess({
  onClose,
  onSendAnother,
}: {
  onClose?: () => void;
  onSendAnother: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center">
      <SuccessIcon />

      <h3 className="mt-4 text-lg font-bold text-[hsl(var(--foreground))]">
        Feedback sent
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        Thanks for helping improve SideFX. Your feedback was saved and can be
        reviewed by the admin team.
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSendAnother}
          className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-semibold transition hover:bg-[hsl(var(--muted))]"
        >
          Send another
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
          >
            Close form
          </button>
        ) : null}
      </div>
    </div>
  );
}

export type FeedbackFormProps = {
  defaultCategory?: FeedbackCategory;
  pageUrl?: string | null;
  submitLabel?: string;
  onSubmitted?: (feedback: UserFeedbackOut) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
};

export default function FeedbackForm({
  defaultCategory = "general",
  pageUrl,
  submitLabel = "Submit feedback",
  onSubmitted,
  onCancel,
  showCancel = false,
  className = "",
}: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [resolvedPageUrl, setResolvedPageUrl] = useState(pageUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (pageUrl !== undefined) {
      setResolvedPageUrl(pageUrl ?? "");
      return;
    }

    setResolvedPageUrl(getCurrentPageUrl());
  }, [pageUrl]);

  const selectedCategory = useMemo(
    () => FEEDBACK_CATEGORIES.find((item) => item.value === category),
    [category],
  );

  const cleanedMessage = normalizeMessage(message);
  const canSubmit = cleanedMessage.length >= 3 && !submitting;
  const remainingChars = MAX_MESSAGE_LENGTH - message.length;

  function resetForAnotherSubmission() {
    setCategory(defaultCategory);
    setRating(null);
    setMessage("");
    setError(null);
    setSubmitted(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (cleanedMessage.length < 3) {
      setError("Please enter at least 3 characters of feedback.");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Please keep your feedback under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    const payload: SubmitFeedbackPayload = {
      category,
      rating,
      message: cleanedMessage,
      page_url: resolvedPageUrl || null,
    };

    setSubmitting(true);

    try {
      const saved = await submitUserFeedback(payload);

      setMessage("");
      setRating(null);
      setSubmitted(true);
      onSubmitted?.(saved);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={["space-y-5", className].join(" ")}>
        <SubmissionSuccess
          onClose={onCancel}
          onSendAnother={resetForAnotherSubmission}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={["space-y-5", className].join(" ")}>
      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="feedback-category" className="text-sm font-semibold">
          Feedback type
        </label>
        <select
          id="feedback-category"
          value={category}
          onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
          className="w-full cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          {FEEDBACK_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {selectedCategory ? (
          <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {selectedCategory.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold">Rating</label>
          <button
            type="button"
            onClick={() => setRating(null)}
            disabled={rating == null}
            className="cursor-pointer text-xs font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarButton
              key={value}
              value={value}
              selected={rating === value}
              onClick={() => setRating(value)}
            />
          ))}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Optional. Use 1 for poor and 5 for excellent.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="feedback-message" className="text-sm font-semibold">
            Message
          </label>
          <span
            className={[
              "text-xs",
              remainingChars < 0
                ? "text-red-600 dark:text-red-400"
                : "text-[hsl(var(--muted-foreground))]",
            ].join(" ")}
          >
            {remainingChars} left
          </span>
        </div>

        <textarea
          id="feedback-message"
          value={message}
          maxLength={MAX_MESSAGE_LENGTH + 200}
          onChange={(event) => {
            setMessage(event.target.value);
            setError(null);
          }}
          placeholder="Tell us what you liked, what could be improved, or what you would like to see next."
          rows={7}
          className="min-h-40 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 text-sm leading-6 outline-none placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {showCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}