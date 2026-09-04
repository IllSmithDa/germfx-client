

import {
  useEffect,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  deleteAccountClient,
} from "@/lib/client/accountsDangerApi";

type Props = {
  hasPassword: boolean;
  hasGoogle: boolean;
  authCapabilitiesReady: boolean;
};

type DeleteAccountValues = {
  current_password: string;
  confirmation_text: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50]";

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

function WarningBox({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-rose-400/30 bg-rose-500/8 px-2 py-3 sm:px-4 sm:py-4">
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
        {title}
      </p>

      <ul className="mt-2 space-y-1 text-sm text-rose-700/90 dark:text-rose-300/90">
        {lines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
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

export default function DeleteAccountCard({
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
    watch,
    formState: {
      errors,
    },
  } =
    useForm<DeleteAccountValues>({
      defaultValues: {
        current_password: "",
        confirmation_text: "",
      },
    });

  const unsupportedAccount =
    authCapabilitiesReady &&
    !hasPassword &&
    !hasGoogle;

  function goToGoogleDeletion() {
    window.location.href =
      "/account/delete";
  }

  function openDeleteFlow() {
    setFeedback(null);
    reset();

    if (
      hasGoogle &&
      !hasPassword
    ) {
      goToGoogleDeletion();
      return;
    }

    setChoosingMethod(
      hasPassword && hasGoogle,
    );

    setOpen(true);
  }

  function usePassword() {
    setChoosingMethod(false);
    setFeedback(null);
    reset();
  }

  async function onSubmit(
    values: DeleteAccountValues,
  ) {
    setPending(true);
    setFeedback(null);

    try {
      const result =
        await deleteAccountClient({
          current_password:
            values.current_password,
          confirmation_text:
            values.confirmation_text,
        });

      setFeedback({
        ok: result.ok,
        message: result.message,
      });

      if (result.ok) {
        reset();

        setTimeout(() => {
          window.location.href =
            "/login";
        }, 1200);
      }
    } finally {
      setPending(false);
    }
  }

  function close() {
    setOpen(false);
    setChoosingMethod(false);
    setFeedback(null);
    reset();
  }

  return (
    <>
      <div className="rounded-xl border border-rose-400/30 bg-rose-500/8 px-2 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              Delete Account
            </h3>

            <p className="mt-1 text-sm text-rose-700/90 dark:text-rose-300/90">
              Permanently remove your
              account. This may also remove
              associated health records and
              cannot easily be undone.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !authCapabilitiesReady
            }
            onClick={
              openDeleteFlow
            }
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
          >
            Delete Account
          </button>
        </div>
      </div>

      <Modal
        open={open}
        title="Delete account permanently"
        description="This action is intended to be irreversible."
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
            <WarningBox
              title="Permanent data loss warning"
              lines={[
                "Your account access will be removed.",
                "Associated health data may be permanently deleted.",
                "This action should only be used if you are absolutely sure.",
              ]}
            />

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
                className="cursor-pointer rounded-xl border border-rose-400/40 bg-rose-500/8 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/15 dark:text-rose-300"
              >
                Use Password
              </button>

              <button
                type="button"
                onClick={
                  goToGoogleDeletion
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
            <WarningBox
              title="Permanent data loss warning"
              lines={[
                "Your account access will be removed.",
                "Associated health data may be permanently deleted.",
                "This action should only be used if you are absolutely sure.",
              ]}
            />

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

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Type DELETE to confirm
              </span>

              <input
                type="text"
                autoComplete="off"
                className={`${inputClass} placeholder:text-[hsl(var(--muted-foreground))/25] opacity-90`}
                placeholder="DELETE"
                {...register(
                  "confirmation_text",
                  {
                    required:
                      "Please type DELETE to confirm",
                    validate: (
                      value,
                    ) =>
                      value ===
                        "DELETE" ||
                      "You must type DELETE exactly",
                  },
                )}
              />

              {errors
                .confirmation_text
                ?.message ? (
                <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                  {
                    errors
                      .confirmation_text
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
                disabled={
                  pending ||
                  watch(
                    "confirmation_text",
                  ) !== "DELETE"
                }
                className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? "Deleting..."
                  : "Delete Account Permanently"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}