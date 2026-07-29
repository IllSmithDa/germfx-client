"use client";

import { useState } from "react";


import FeedbackModal from "@/components/UserFeedback/FeedbackModal";
import { FeedbackCategory } from "@/types/userFeedback";

export type FeedbackButtonVariant = "button" | "link" | "floating";

export type FeedbackButtonProps = {
  label?: string;
  variant?: FeedbackButtonVariant;
  defaultCategory?: FeedbackCategory;
  pageUrl?: string | null;
  className?: string;
};

function buttonClassName(variant: FeedbackButtonVariant, className: string) {
  const base = "font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  if (variant === "link") {
    return [
      base,
      "text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
      className,
    ].join(" ");
  }

  if (variant === "floating") {
    return [
      base,
      "fixed bottom-5 right-5 z-40 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm shadow-lg hover:bg-[hsl(var(--muted))]",
      className,
    ].join(" ");
  }

  return [
    base,
    "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]",
    className,
  ].join(" ");
}

export default function FeedbackPage({
  label = "Feedback",
  variant = "button",
  defaultCategory = "general",
  pageUrl,
  className = "",
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName(variant, className)}
      >
        {label}
      </button>

      <FeedbackModal
        open={open}
        onOpenChange={setOpen}
        defaultCategory={defaultCategory}
        pageUrl={pageUrl}
      />
    </>
  );
}