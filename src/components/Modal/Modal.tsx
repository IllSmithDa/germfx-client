"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClassName?: string; // e.g. "max-w-xl"
};

export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  maxWidthClassName = "max-w-xl",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Optional: lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/50"
      />

      {/* Dialog */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full ${maxWidthClassName} rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg`}
        >
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
            <div className="text-sm font-semibold">{title ?? ""}</div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[hsl(var(--border))] px-3 py-1 text-lg font-medium hover:bg-[hsl(var(--background))] cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}