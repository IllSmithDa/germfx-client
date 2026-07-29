"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { deleteUserSymptomLog } from "@/app/actions/symptomLogActions";
import { useEscapeToClose } from "@/app/hooks/useEscapeToClose";
import { useLockBodyScroll } from "@/app/hooks/useLockBodyScroll";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

type Props = {
  symptomLogId: number;
  symptomText: string;
  date?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--destructive))] px-4 py-2 text-sm font-semibold text-[hsl(var(--destructive-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
    >
      {pending ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Deleting…
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="2,4 14,4" strokeLinecap="round" />
            <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
            <path d="M3.5 4l.8 9.5a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9L12.5 4" />
            <line x1="6.5" y1="7" x2="6.5" y2="11" strokeLinecap="round" />
            <line x1="9.5" y1="7" x2="9.5" y2="11" strokeLinecap="round" />
          </svg>
          Yes, delete
        </>
      )}
    </button>
  );
}

export default function DeleteSymptomLogControl({
  symptomLogId,
  symptomText,
  date,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dateLabel = formatDate(date);
  useLockBodyScroll(open);
  useEscapeToClose(open, () => {
    if (!busy) setOpen(false);
  });
  const busy = isDeleting || isPending;

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setError(null);
    setIsDeleting(true);
    
    const result = await deleteUserSymptomLog({
      symptom_log_id: symptomLogId,
    });
  
    if (!result.ok) {
      setError(result.error ?? "Failed to delete symptom log.");
      setIsDeleting(false);
      return;
    }
  
    setShouldClose(true);
  
    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    if (!shouldClose || isPending) return;

    setIsDeleting(false);
    setShouldClose(false);
    setOpen(false);
  }, [shouldClose, isPending]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="2,4 14,4" strokeLinecap="round" />
          <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
          <path d="M3.5 4l.8 9.5a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9L12.5 4" />
          <line x1="6.5" y1="7" x2="6.5" y2="11" strokeLinecap="round" />
          <line x1="9.5" y1="7" x2="9.5" y2="11" strokeLinecap="round" />
        </svg>
        Delete
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-log-title"
          aria-describedby="delete-log-desc"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!busy) setOpen(false);
            }}
            aria-label="Close"
            tabIndex={-1}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl overflow-hidden">
            <div className="h-0.5 w-full bg-rose-500 opacity-70" />

            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/10 border border-rose-400/30">
                  <svg className="w-4 h-4 text-rose-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2L1.5 13.5h13L8 2z" />
                    <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
                    <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <h3 id="delete-log-title" className="text-sm font-semibold">
                    Delete symptom log?
                  </h3>
                  <p
                    id="delete-log-desc"
                    className="mt-1 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed"
                  >
                    This will permanently delete{" "}
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      &ldquo;{symptomText}&rdquo;
                    </span>
                    {dateLabel && (
                      <>
                        {" "}logged on{" "}
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          {dateLabel}
                        </span>
                      </>
                    )}
                    . This action cannot be undone.
                  </p>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-[hsl(var(--destructive))]">
                  {error}
                </p>
              )}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (!busy) setOpen(false);
                  }}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors"
                >
                  Cancel
                </button>
                <form
                  onSubmit={handleDelete}
                >
                  <DeleteSubmitButton />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
