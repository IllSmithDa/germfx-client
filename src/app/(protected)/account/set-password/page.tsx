"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import {
  getRecentAuthStatusClient,
  setPasswordClient,
} from "@/lib/server/accountSettingsApi";
import {
  startGoogleReauthentication,
} from "@/lib/helpers/reauthGoogleClient";
import type {
  SetPasswordFormValues,
} from "@/types/accountSettings";

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

type PageState =
  | "checking"
  | "verification_required"
  | "verified"
  | "already_set"
  | "error";

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-2 sm:px-4 py-2 sm:py-3.5 pr-20 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/45]";

function PasswordField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </span>

      <div className="relative">
        <input
          {...props}
          type={
            showPassword
              ? "text"
              : "password"
          }
          className={inputClass}
        />

        <button
          type="button"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          onClick={() =>
            setShowPassword(
              (value) => !value,
            )
          }
          className="absolute inset-y-0 right-3 inline-flex cursor-pointer items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus:outline-none"
        >
          {showPassword ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Show
            </>
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function Feedback({
  state,
}: {
  state: FeedbackState;
}) {
  if (!state) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-xl border px-2 sm:px-4 py-3 text-sm",
        state.ok
          ? "border-emerald-400/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-rose-400/40 bg-rose-500/8 text-rose-700 dark:text-rose-400",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

export default function SetPasswordPage() {
  const [
    pageState,
    setPageState,
  ] =
    useState<PageState>("checking");

  const [
    pending,
    setPending,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: {
      errors,
    },
  } =
    useForm<SetPasswordFormValues>(
      {
        defaultValues: {
          new_password: "",
          confirm_new_password: "",
        },
      },
    );

  async function checkRecentAuth() {
    setPageState("checking");
    setFeedback(null);

    const result =
      await getRecentAuthStatusClient();

    if (!result.ok) {
      /*
       * The common case here is missing/expired recent Google auth.
       * Do not trust ?reauth=success; the backend cookie is authoritative.
       */
      setPageState(
        "verification_required",
      );
      return;
    }

    if (
      result.data.verified &&
      result.data.provider ===
        "google" &&
      result.data
        .eligible_for_set_password &&
      !result.data.has_password
    ) {
      setPageState("verified");
      return;
    }

    if (
      result.data.has_password ||
      !result.data
        .eligible_for_set_password
    ) {
      setPageState("already_set");
      return;
    }

    setPageState("error");
    setFeedback({
      ok: false,
      message:
        "Unable to confirm that this account is eligible to set a password.",
    });
  }

  useEffect(() => {
    void checkRecentAuth();
  }, []);

  function verifyWithGoogle() {
    setFeedback(null);

    startGoogleReauthentication(
      "/account/set-password",
    );
  }

  async function onSubmit(
    values: SetPasswordFormValues,
  ) {
    setPending(true);
    setFeedback(null);

    try {
      const result =
        await setPasswordClient(
          values,
        );

      if (!result.ok) {
        /*
         * If recent auth expired while the user was filling out the form,
         * re-check backend state. This will return the page to the Google
         * verification prompt when appropriate.
         */
        const message =
          result.message ||
          "Unable to set password.";

        setFeedback({
          ok: false,
          message,
        });

        const normalizedMessage =
          message.toLowerCase();

        if (
          normalizedMessage.includes(
            "recent",
          ) ||
          normalizedMessage.includes(
            "verify",
          ) ||
          normalizedMessage.includes(
            "authentication",
          )
        ) {
          reset();
          await checkRecentAuth();
        }

        return;
      }

      setFeedback({
        ok: true,
        message:
          result.message ||
          "GermFx password set successfully. Please log in again.",
      });

      reset();

      setTimeout(() => {
        window.location.href =
          "/login";
      }, 1500);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[hsl(var(--background))] px-2 sm:px-4 py-2 sm:py-10">
      <div className="w-full max-w-lg">
        <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
          <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-70" />

          <div className="border-b border-[hsl(var(--border))] px-2 py-2 sm:px-5  sm:py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]">
                <KeyRound className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Set Password
                </h1>

                <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  Add a GermFx password to
                  your Google-authenticated
                  account.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-2 py-2 sm:px-6 sm:py-6">
            {pageState ===
            "checking" ? (
              <div
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]"
                role="status"
                aria-live="polite"
              >
                Checking Google
                verification...
              </div>
            ) : null}

            {pageState ===
            "verification_required" ? (
              <>
                <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3.5 text-sm leading-5 text-sky-700 dark:text-sky-300">
                  Verify the Google account
                  linked to this GermFx
                  account before adding a
                  password.
                </div>

                <button
                  type="button"
                  onClick={
                    verifyWithGoogle
                  }
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
                >
                  Verify with Google
                </button>
              </>
            ) : null}

            {pageState ===
            "already_set" ? (
              <>
                <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3.5 text-sm text-amber-800 dark:text-amber-300">
                  This account already has
                  a GermFx password. Use
                  Change Password from
                  Account Settings instead.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/settings";
                  }}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40]"
                >
                  Return to Settings
                </button>
              </>
            ) : null}

            {pageState ===
            "error" ? (
              <>
                <Feedback
                  state={feedback}
                />

                <button
                  type="button"
                  onClick={() =>
                    void checkRecentAuth()
                  }
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40]"
                >
                  Try Again
                </button>
              </>
            ) : null}

            {pageState ===
            "verified" ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/8 px-4 py-3.5 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Google identity
                      verified
                    </p>

                    <p className="mt-1 text-sm leading-5">
                      You can now create
                      your GermFx password.
                      This verification is
                      temporary.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm leading-5 text-sky-700 dark:text-sky-300">
                  Adding a password will
                  not remove Google
                  sign-in. After this is
                  complete, you will be
                  able to sign in using
                  either Google or your
                  GermFx credentials.
                </div>

                <form
                  onSubmit={handleSubmit(
                    onSubmit,
                  )}
                  className="space-y-4"
                >
                  <PasswordField
                    label="New Password"
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                    error={
                      errors.new_password
                        ?.message
                    }
                    {...register(
                      "new_password",
                      {
                        required:
                          "New password is required",
                        minLength: {
                          value: 8,
                          message:
                            "Must be at least 8 characters",
                        },
                        maxLength: {
                          value: 128,
                          message:
                            "Must be 128 characters or fewer",
                        },
                      },
                    )}
                  />

                  <PasswordField
                    label="Confirm New Password"
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    error={
                      errors
                        .confirm_new_password
                        ?.message
                    }
                    {...register(
                      "confirm_new_password",
                      {
                        required:
                          "Please confirm your new password",
                        validate: (
                          value,
                        ) =>
                          value ===
                            watch(
                              "new_password",
                            ) ||
                          "Passwords do not match",
                      },
                    )}
                  />

                  <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                    Passwords must be
                    between 8 and 128
                    characters.
                  </p>

                  <Feedback
                    state={feedback}
                  />

                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  >
                    {pending
                      ? "Setting Password..."
                      : "Set Password"}
                  </button>
                </form>

                <p className="text-center text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  For security, you will
                  be signed out after
                  successfully creating
                  your password and asked
                  to sign in again.
                </p>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
