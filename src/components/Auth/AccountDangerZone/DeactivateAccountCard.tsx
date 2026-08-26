"use client";

import {
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";

import {
  deactivateAccountClient,
} from "@/lib/client/accountsDangerApi";
import {
  startGoogleReauthentication,
} from "@/lib/helpers/reauthGoogleClient";

type Props = {
  hasPassword: boolean;
  hasGoogle: boolean;
  authCapabilitiesReady: boolean;
};

type ConfirmPasswordValues = {
  current_password: string;
};

type VerificationMethod =
  | "password"
  | "google"
  | null;

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

function googleReauthErrorMessage(
  code: string,
) {
  const messages: Record<string, string> = {
    GOOGLE_REAUTH_ACCOUNT_MISMATCH:
      "The Google account you selected does not match the Google account linked to this GermFx account.",
    GOOGLE_REAUTH_NOT_LINKED:
      "This GermFx account is not linked to Google.",
    GOOGLE_REAUTH_AUTH_REQUIRED:
      "Your GermFx session expired. Please sign in again.",
    GOOGLE_OAUTH_DENIED:
      "Google verification was cancelled.",
    GOOGLE_OAUTH_STATE_INVALID:
      "Your Google verification session expired. Please try again.",
    GOOGLE_ID_TOKEN_INVALID:
      "Google could not verify your identity. Please try again.",
    GOOGLE_OAUTH_UNAVAILABLE:
      "Google verification is temporarily unavailable. Please try again.",
  };

  return (
    messages[code] ??
    "Unable to verify your Google account. Please try again."
  );
}

function buildDeactivateReauthReturnTo() {
  const url = new URL(
    window.location.href,
  );

  url.searchParams.set(
    "danger_action",
    "deactivate",
  );
  url.searchParams.delete("reauth");
  url.searchParams.delete(
    "reauth_error",
  );

  return `${url.pathname}${url.search}${url.hash}`;
}

export default function DeactivateAccountCard({
  hasPassword,
  hasGoogle,
  authCapabilitiesReady,
}: Props) {
  const [open, setOpen] =
    useState(false);
  const [pending, setPending] =
    useState(false);
  const [feedback, setFeedback] =
    useState<FeedbackState>(null);
  const [
    googleRecentlyVerified,
    setGoogleRecentlyVerified,
  ] = useState(false);
  const [
    verificationMethod,
    setVerificationMethod,
  ] = useState<VerificationMethod>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmPasswordValues>({
    defaultValues: {
      current_password: "",
    },
  });

  const supportsPassword =
    authCapabilitiesReady &&
    hasPassword;

  const supportsGoogle =
    authCapabilitiesReady &&
    hasGoogle;

  const unsupportedAccount =
    authCapabilitiesReady &&
    !hasPassword &&
    !hasGoogle;

  useEffect(() => {
    const url = new URL(
      window.location.href,
    );

    if (
      url.searchParams.get(
        "danger_action",
      ) !== "deactivate"
    ) {
      return;
    }

    const reauthSuccess =
      url.searchParams.get("reauth") ===
      "success";
    const reauthError =
      url.searchParams.get(
        "reauth_error",
      );

    if (reauthSuccess) {
      setVerificationMethod("google");
      setGoogleRecentlyVerified(true);

      // Do not also set a success Feedback message here.
      // The dedicated green verified state below is the single
      // Google-verification success message shown to the user.
      setFeedback(null);
      setOpen(true);
    } else if (reauthError) {
      setVerificationMethod("google");
      setGoogleRecentlyVerified(false);
      setFeedback({
        ok: false,
        message:
          googleReauthErrorMessage(
            reauthError,
          ),
      });
      setOpen(true);
    }

    if (
      reauthSuccess ||
      reauthError
    ) {
      url.searchParams.delete(
        "danger_action",
      );
      url.searchParams.delete("reauth");
      url.searchParams.delete(
        "reauth_error",
      );

      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  }, []);

  function openModal() {
    setFeedback(null);
    setGoogleRecentlyVerified(false);
    reset();

    if (hasPassword && hasGoogle) {
      // Do not assume which authentication method the user wants.
      // This prevents a password-specific message from flashing before
      // Google verification is selected.
      setVerificationMethod(null);
    } else if (hasPassword) {
      setVerificationMethod(
        "password",
      );
    } else if (hasGoogle) {
      setVerificationMethod("google");
    } else {
      setVerificationMethod(null);
    }

    setOpen(true);
  }

  async function onSubmit(
    values: ConfirmPasswordValues,
  ) {
    if (
      verificationMethod === "google" &&
      !googleRecentlyVerified
    ) {
      setFeedback({
        ok: false,
        message:
          "Verify your Google account before deactivating your GermFx account.",
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const payload =
        verificationMethod ===
        "password"
          ? values
          : ({} as Parameters<
              typeof deactivateAccountClient
            >[0]);

      const result =
        await deactivateAccountClient(
          payload,
        );

      setFeedback({
        ok: result.ok,
        message: result.message,
      });

      if (
        !result.ok &&
        verificationMethod ===
          "google"
      ) {
        // Recent Google verification may have expired
        // or been revoked.
        setGoogleRecentlyVerified(
          false,
        );
      }

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
    setVerificationMethod(
      "password",
    );
    setGoogleRecentlyVerified(false);
    setFeedback(null);
    reset();
  }

  function verifyWithGoogle() {
    setVerificationMethod("google");
    setFeedback(null);

    startGoogleReauthentication(
      buildDeactivateReauthReturnTo(),
    );
  }

  function close() {
    setOpen(false);
    reset();
    setFeedback(null);
    setGoogleRecentlyVerified(false);

    setVerificationMethod(null);
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
            onClick={openModal}
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
        ) : (
          <div className="space-y-4">
            {supportsPassword &&
            supportsGoogle &&
            verificationMethod === null ? (
              <div className="space-y-3">
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
                    onClick={() =>
                      setVerificationMethod(
                        "google",
                      )
                    }
                    className="cursor-pointer rounded-xl border border-sky-400/40 bg-sky-500/8 px-3 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
                  >
                    Use Google
                  </button>
                </div>
              </div>
            ) : null}

            {supportsPassword &&
            supportsGoogle &&
            verificationMethod !== null &&
            !googleRecentlyVerified ? (
              <button
                type="button"
                onClick={() => {
                  setVerificationMethod(null);
                  setFeedback(null);
                  reset();
                }}
                className="text-sm font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-sky-300"
              >
                Use a different verification method
              </button>
            ) : null}

            {verificationMethod ===
              "password" &&
            supportsPassword ? (
              <form
                onSubmit={handleSubmit(
                  onSubmit,
                )}
                className="space-y-4"
              >
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

            {verificationMethod ===
              "google" &&
            supportsGoogle ? (
              <div className="space-y-4">
                {googleRecentlyVerified ? (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    ✓ Google identity
                    verified. You can now
                    confirm account
                    deactivation.
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
                      Verify the Google
                      account linked to this
                      GermFx account before
                      deactivating it.
                    </div>

                    <button
                      type="button"
                      onClick={
                        verifyWithGoogle
                      }
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
                    >
                      Verify with Google
                    </button>
                  </>
                )}

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
                    type="button"
                    disabled={
                      pending ||
                      !googleRecentlyVerified
                    }
                    onClick={() =>
                      void onSubmit({
                        current_password:
                          "",
                      })
                    }
                    className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending
                      ? "Processing..."
                      : "Confirm Deactivation"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
