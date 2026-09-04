"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  deactivateAccountClient,
} from "@/lib/client/accountsDangerApi";

type Props = {
  hasPassword: boolean;
  hasGoogle: boolean;
  authCapabilitiesReady: boolean;
};

type ConfirmPasswordValues = {
  current_password: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-2 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50] sm:px-4 sm:py-4";

function Feedback({
  state,
}: {
  state: FeedbackState;
}) {
  if (!state) return null;

  return (
    <div
      className={[
        "rounded-xl border px-2 py-3 text-sm sm:px-4 sm:py-4",
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

    const originalOverflow =
      document.body.style.overflow;
    const originalPaddingRight =
      document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow =
      "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    const onKey = (
      e: KeyboardEvent,
    ) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKey,
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;
      document.body.style.paddingRight =
        originalPaddingRight;
      document.removeEventListener(
        "keydown",
        onKey,
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="border-b border-[hsl(var(--border))] px-2 py-3 sm:px-4 sm:py-4">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
            {title}
          </h3>

          {description ? (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          ) : null}
        </div>

        <div className="px-2 py-3 sm:px-4 sm:py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DeactivateAccountCard({
  hasPassword,
  hasGoogle,
  authCapabilitiesReady,
}: Props) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    pending,
    setPending,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>(null);

  const [
    choosingMethod,
    setChoosingMethod,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } =
    useForm<ConfirmPasswordValues>(
      {
        defaultValues: {
          current_password: "",
        },
      },
    );

  const unsupportedAccount =
    authCapabilitiesReady &&
    !hasPassword &&
    !hasGoogle;

  function goToGoogleDeactivation() {
    window.location.href =
      "/account/deactivate";
  }

  function openDeactivateFlow() {
    setFeedback(null);
    reset();

    if (
      hasGoogle &&
      !hasPassword
    ) {
      goToGoogleDeactivation();
      return;
    }

    setChoosingMethod(
      hasPassword && hasGoogle,
    );
    setOpen(true);
  }

  async function onSubmit(
    values: ConfirmPasswordValues,
  ) {
    setPending(true);
    setFeedback(null);

    try {
      const result =
        await deactivateAccountClient(
          values,
        );

      setFeedback({
        ok: result.ok,
        message: result.message,
      });

      if (result.ok) {
        setTimeout(() => {
          window.location.href =
            "/login";
        }, 1200);
      }
    } finally {
      setPending(false);
    }
  }

  function usePassword() {
    setChoosingMethod(false);
    setFeedback(null);
    reset();
  }

  function close() {
    setOpen(false);
    setChoosingMethod(false);
    setFeedback(null);
    reset();
  }

  return (
    <>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Deactivate Account
            </h3>

            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Temporarily disable access to
              your account. This is safer
              than permanent deletion.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !authCapabilitiesReady
            }
            onClick={
              openDeactivateFlow
            }
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400"
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
        {unsupportedAccount ? (
          <div className="space-y-4">
            <Feedback
              state={{
                ok: false,
                message:
                  "No supported reauthentication method is available for this account.",
              }}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Close
              </button>
            </div>
          </div>
        ) : choosingMethod ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/20] px-4 py-3">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                Verify your identity to
                continue.
              </p>

              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Choose the authentication
                method you want to use.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={usePassword}
                className="cursor-pointer rounded-xl border border-amber-400/40 bg-amber-500/8 px-3 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-300"
              >
                Use Password
              </button>

              <button
                type="button"
                onClick={
                  goToGoogleDeactivation
                }
                className="cursor-pointer rounded-xl border border-sky-400/40 bg-sky-500/8 px-3 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
              >
                Use Google
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : hasPassword ? (
          <form
            onSubmit={handleSubmit(
              onSubmit,
            )}
            className="space-y-4"
          >
            {hasGoogle ? (
              <button
                type="button"
                onClick={() => {
                  setChoosingMethod(true);
                  setFeedback(null);
                  reset();
                }}
                className="text-sm font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-sky-300"
              >
                Use a different verification
                method
              </button>
            ) : null}

            <div className="rounded-xl border border-amber-400/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              Enter your current GermFx
              password to confirm this
              action.
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Current Password
              </span>

              <input
                type="password"
                autoComplete="current-password"
                className={
                  inputClass
                }
                placeholder="Enter your current password"
                {...register(
                  "current_password",
                  {
                    required:
                      "Current password is required",
                  },
                )}
              />

              {errors
                .current_password
                ?.message ? (
                <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                  {
                    errors
                      .current_password
                      .message
                  }
                </p>
              ) : null}
            </label>

            <Feedback
              state={feedback}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={pending}
                className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? "Processing..."
                  : "Confirm Deactivation"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
