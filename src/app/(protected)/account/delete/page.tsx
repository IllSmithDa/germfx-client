"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  useForm,
} from "react-hook-form";

import {
  deleteAccountClient,
} from "@/lib/client/accountsDangerApi";
import {
  getRecentAuthStatusClient,
} from "@/lib/server/accountSettingsApi";
import {
  startGoogleReauthentication,
} from "@/lib/helpers/reauthGoogleClient";

type PageState =
  | "checking"
  | "verification_required"
  | "verified"
  | "error";

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

type DeleteFormValues = {
  confirmation_text: string;
};

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/25]";

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
        "rounded-xl border px-4 py-3 text-sm",
        state.ok
          ? "border-emerald-400/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-rose-400/40 bg-rose-500/8 text-rose-700 dark:text-rose-400",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

export default function DeleteAccountPage() {
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
    reset,
    watch,
    formState: {
      errors,
    },
  } =
    useForm<DeleteFormValues>({
      defaultValues: {
        confirmation_text: "",
      },
    });

  async function checkRecentAuth() {
    setPageState("checking");
    setFeedback(null);

    const result =
      await getRecentAuthStatusClient();

    if (!result.ok) {
      setPageState(
        "verification_required",
      );
      return;
    }

    if (
      result.data.verified &&
      result.data.provider ===
        "google"
    ) {
      setPageState("verified");
      return;
    }

    setPageState("error");
    setFeedback({
      ok: false,
      message:
        "Unable to confirm a valid Google verification for this account.",
    });
  }

  useEffect(() => {
    void checkRecentAuth();
  }, []);

  function verifyWithGoogle() {
    setFeedback(null);

    startGoogleReauthentication(
      "/account/delete",
    );
  }

  async function onSubmit(
    values: DeleteFormValues,
  ) {
    if (pageState !== "verified") {
      setFeedback({
        ok: false,
        message:
          "Verify your Google account before deleting your GermFx account.",
      });
      return;
    }

    if (
      values.confirmation_text !==
      "DELETE"
    ) {
      setFeedback({
        ok: false,
        message:
          "Type DELETE exactly to confirm permanent account deletion.",
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result =
        await deleteAccountClient({
          confirmation_text:
            values.confirmation_text,
        });

      if (!result.ok) {
        setFeedback({
          ok: false,
          message:
            result.message ||
            "Unable to delete your account.",
        });

        /*
         * Do not assume every delete failure means Google verification
         * expired. Check the authoritative backend recent-auth state and
         * only return to verification when it is actually no longer valid.
         */
        const authStatus =
          await getRecentAuthStatusClient();

        if (
          !authStatus.ok ||
          !authStatus.data.verified ||
          authStatus.data.provider !==
            "google"
        ) {
          reset();
          setPageState(
            "verification_required",
          );
          setFeedback({
            ok: false,
            message:
              "Your Google verification expired. Verify your identity again before deleting your account.",
          });
        }

        return;
      }

      setFeedback({
        ok: true,
        message:
          result.message ||
          "Account deleted successfully.",
      });

      reset();

      setTimeout(() => {
        window.location.href =
          "/login";
      }, 1200);
    } finally {
      setPending(false);
    }
  }

  const confirmationText =
    watch("confirmation_text");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[hsl(var(--background))] px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg">
        <section className="overflow-hidden rounded-2xl border border-rose-500/30 bg-[hsl(var(--card))] shadow-lg">
          <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 opacity-80" />

          <div className="border-b border-[hsl(var(--border))] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                  Delete Account
                </h1>

                <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  Permanently remove your
                  GermFx account and
                  associated account data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/8 px-4 py-3.5 text-rose-700 dark:text-rose-300">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="text-sm font-semibold">
                  Permanent data loss
                </p>

                <ul className="mt-2 space-y-1 text-sm leading-5">
                  <li>
                    • Your GermFx account
                    access will be removed.
                  </li>
                  <li>
                    • Associated health logs,
                    medications, and related
                    account data may be
                    permanently deleted.
                  </li>
                  <li>
                    • This action is intended
                    to be irreversible.
                  </li>
                </ul>
              </div>
            </div>

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
                  account before permanently
                  deleting it.
                </div>

                <Feedback
                  state={feedback}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={
                      verifyWithGoogle
                    }
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-sky-300"
                  >
                    Verify with Google
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/account";
                  }}
                  className="text-sm font-medium text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition hover:text-[hsl(var(--foreground))]"
                >
                  Return to Account
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
                      You can now confirm
                      permanent account
                      deletion. This
                      verification is
                      temporary.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(
                    onSubmit,
                  )}
                  className="space-y-4"
                >
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Type DELETE to confirm
                    </span>

                    <input
                      type="text"
                      autoComplete="off"
                      className={`${inputClass} opacity-90`}
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

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        window.location.href =
                          "/account";
                      }}
                      className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        pending ||
                        confirmationText !==
                          "DELETE"
                      }
                      className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pending
                        ? "Deleting..."
                        : "Delete Account Permanently"}
                    </button>
                  </div>
                </form>
              </>
            ) : null}

            {pageState ===
            "error" ? (
              <>
                <Feedback
                  state={feedback}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/account";
                    }}
                    className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40]"
                  >
                    Return to Account
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void checkRecentAuth()
                    }
                    className="cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
                  >
                    Try Again
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}