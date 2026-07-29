"use client";

import { useState } from "react";

import FeedbackModal from "@/components/UserFeedback/FeedbackModal";
import type { FeedbackCategory } from "@/types/userFeedback";

export type FeedbackButtonVariant = "button" | "link" | "floating";

export type FeedbackButtonProps = {
  label?: string;
  variant?: FeedbackButtonVariant;
  defaultCategory?: FeedbackCategory;
  pageUrl?: string | null;
  className?: string;
};

function buttonClassName(
  variant: FeedbackButtonVariant,
  className: string,
) {
  const base =
    "font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  if (variant === "link") {
    return [
      base,
      "text-sm text-[hsl(var(--muted-foreground))]",
      "hover:text-[hsl(var(--foreground))]",
      className,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (variant === "floating") {
    return [
      base,
      "fixed bottom-5 right-5 z-40 rounded-full",
      "border border-[hsl(var(--border))]",
      "bg-[hsl(var(--card))] px-4 py-3 text-sm shadow-lg",
      "hover:bg-[hsl(var(--muted))]",
      "focus:outline-none focus-visible:ring-2",
      "focus-visible:ring-[hsl(var(--ring))]",
      className,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    base,
    "rounded-xl border border-[hsl(var(--border))]",
    "bg-[hsl(var(--card))] px-4 py-2 text-sm",
    "hover:bg-[hsl(var(--muted))]",
    "focus:outline-none focus-visible:ring-2",
    "focus-visible:ring-[hsl(var(--ring))]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function FeedbackButton({
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