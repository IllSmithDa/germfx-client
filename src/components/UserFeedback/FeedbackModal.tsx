"use client";

import { useEffect, useRef } from "react";

import FeedbackForm, { type FeedbackFormProps } from "./FeedbackForm";

export type FeedbackModalProps = FeedbackFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export default function FeedbackModal({
  open,
  onOpenChange,
  title = "Got Feedback?",
  description = "Tell us what you liked, what felt confusing, or what you would like improved.",
  onSubmitted,
  ...formProps
}: FeedbackModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeoutId = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close feedback form"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
        className="relative max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl"
      >
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="feedback-modal-title" className="text-xl font-bold">
                {title}
              </h2>
              <p
                id="feedback-modal-description"
                className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]"
              >
                {description}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <FeedbackForm
            {...formProps}
            showCancel
            onCancel={() => onOpenChange(false)}
            onSubmitted={(feedback) => {
              onSubmitted?.(feedback);
            }}
          />
        </div>
      </section>
    </div>
  );
}