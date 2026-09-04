"use client";

import { useEffect, useState } from "react";
import { Power, ShieldCheck, TriangleAlert } from "lucide-react";

import { deactivateAccountClient } from "@/lib/client/accountsDangerApi";
import { getRecentAuthStatusClient } from "@/lib/server/accountSettingsApi";
import { startGoogleReauthentication } from "@/lib/helpers/reauthGoogleClient";

type PageState =
  | "checking"
  | "verification_required"
  | "verified"
  | "error";

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null;

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

export default function DeactivateAccountPage() {
  const [pageState, setPageState] = useState<PageState>("checking");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  async function checkRecentAuth() {
    setPageState("checking");
    setFeedback(null);

    const result = await getRecentAuthStatusClient();

    if (!result.ok) {
      setPageState("verification_required");
      return;
    }

    if (result.data.verified && result.data.provider === "google") {
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
    startGoogleReauthentication("/account/deactivate");
  }

  async function confirmDeactivation() {
    if (pageState !== "verified") {
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
      const result = await deactivateAccountClient({});

      if (!result.ok) {
        setFeedback({
          ok: false,
          message: result.message || "Unable to deactivate your account.",
        });

        await checkRecentAuth();
        return;
      }

      setFeedback({
        ok: true,
        message:
          result.message ||
          "Account deactivated successfully. Please log in again if you reactivate your account later.",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[hsl(var(--background))] px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg">
        <section className="overflow-hidden rounded-2xl border border-amber-400/30 bg-[hsl(var(--card))] shadow-lg">
          <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-80" />

          <div className="border-b border-[hsl(var(--border))] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Power className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Deactivate Account
                </h1>
                <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  Temporarily disable access to your GermFx account.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/8 px-4 py-3.5 text-amber-800 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Before you continue</p>
                <ul className="mt-2 space-y-1 text-sm leading-5">
                  <li>• You will be signed out.</li>
                  <li>
                    • Future logins will be blocked until the account is
                    reactivated.
                  </li>
                  <li>
                    • Deactivation is safer than permanent deletion because
                    your account can be restored later.
                  </li>
                </ul>
              </div>
            </div>

            {pageState === "checking" ? (
              <div
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]"
                role="status"
                aria-live="polite"
              >
                Checking Google verification...
              </div>
            ) : null}

            {pageState === "verification_required" ? (
              <>
                <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3.5 text-sm leading-5 text-sky-700 dark:text-sky-300">
                  Verify the Google account linked to this GermFx account
                  before deactivating it.
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={verifyWithGoogle}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-sky-300"
                  >
                    Verify with Google
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/account";
                  }}
                  className="text-sm font-medium text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition hover:text-[hsl(var(--foreground))]"
                >
                  Return to Account
                </button>
              </>
            ) : null}

            {pageState === "verified" ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/8 px-4 py-3.5 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      Google identity verified
                    </p>
                    <p className="mt-1 text-sm leading-5">
                      You can now confirm account deactivation. This
                      verification is temporary.
                    </p>
                  </div>
                </div>

                <Feedback state={feedback} />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      window.location.href = "/account";
                    }}
                    className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void confirmDeactivation()}
                    className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Processing..." : "Confirm Deactivation"}
                  </button>
                </div>
              </>
            ) : null}

            {pageState === "error" ? (
              <>
                <Feedback state={feedback} />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/account";
                    }}
                    className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))/40]"
                  >
                    Return to Account
                  </button>

                  <button
                    type="button"
                    onClick={() => void checkRecentAuth()}
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