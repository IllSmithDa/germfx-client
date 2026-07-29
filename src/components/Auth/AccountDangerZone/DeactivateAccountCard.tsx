"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { deactivateAccountClient } from "@/lib/client/accountsDangerApi";

type ConfirmPasswordValues = {
  current_password: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50]";

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null;
  return (
    <div
      className={[
        "rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-400/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-rose-400/40 bg-rose-500/8 text-rose-700 dark:text-rose-400",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="border-b border-[hsl(var(--border))] px-5 py-4">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export default function DeactivateAccountCard() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmPasswordValues>({
    defaultValues: { current_password: "" },
  });

  async function onSubmit(values: ConfirmPasswordValues) {
    setPending(true);
    setFeedback(null);

    try {
      const result = await deactivateAccountClient(values);
      setFeedback({ ok: result.ok, message: result.message });

      if (result.ok) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    } finally {
      setPending(false);
    }
  }

  function close() {
    setOpen(false);
    reset();
    setFeedback(null);
  }

  return (
    <>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Deactivate Account
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Temporarily disable access to your account. This is safer than permanent deletion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-400  cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      </div>

      <Modal
        open={open}
        title="Deactivate account"
        description="You will be signed out and login will be blocked until your account is reactivated."
        onClose={close}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Enter your current password to confirm this action.
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Current Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              placeholder="Enter your current password"
              {...register("current_password", {
                required: "Current password is required",
              })}
            />
            {errors.current_password?.message ? (
              <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                {errors.current_password.message}
              </p>
            ) : null}
          </label>

          <Feedback state={feedback} />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Processing..." : "Confirm Deactivation"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}