"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import TurnstileWidget from "@/components/Turnstile/TurnstileWidget";
import {
  API_PROXY_PATHS,
  CLIENT_PATHS,
} from "@/config/paths";

const GoogleRegistrationSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Letters, numbers, and underscores only",
    ),
  accepted: z.boolean().refine(
    (value) => value === true,
    {
      message:
        "You must agree to the Terms & Privacy Policy",
    },
  ),
});

type GoogleRegistrationValues =
  z.infer<typeof GoogleRegistrationSchema>;

type PendingGoogleRegistration = {
  provider: "google";
  email: string;
  registration_pending: boolean;
};

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all dark:bg-[hsl(220_25%_12%)] dark:text-[hsl(210_30%_94%)] dark:placeholder:text-[hsl(215_14%_48%)]";

const inputNormal =
  "border-slate-300 hover:border-slate-400 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20 dark:border-[hsl(220_20%_20%)] dark:hover:border-[hsl(220_16%_30%)] dark:focus:border-[hsl(210_80%_62%/0.6)] dark:focus:ring-[hsl(210_80%_62%/0.2)]";

const inputError =
  "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-[hsl(0_70%_55%/0.7)] dark:focus:ring-[hsl(0_70%_55%/0.2)]";

function readErrorMessage(
  data: unknown,
  fallback: string,
) {
  if (
    data &&
    typeof data === "object" &&
    "detail" in data
  ) {
    const detail = (
      data as { detail?: unknown }
    ).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (
      detail &&
      typeof detail === "object" &&
      "message" in detail &&
      typeof (
        detail as { message?: unknown }
      ).message === "string"
    ) {
      return (
        detail as { message: string }
      ).message;
    }
  }

  return fallback;
}

export default function GoogleRegisterPage() {
  const router = useRouter();

  const [pending, setPending] =
    useState<PendingGoogleRegistration | null>(
      null,
    );
  const [loadingPending, setLoadingPending] =
    useState(true);
  const [pageError, setPageError] =
    useState<string | null>(null);

  const [turnstileToken, setTurnstileToken] =
    useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] =
    useState(0);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
    setError,
  } = useForm<GoogleRegistrationValues>({
    resolver: zodResolver(
      GoogleRegistrationSchema,
    ),
    defaultValues: {
      username: "",
      accepted: false,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    let cancelled = false;

    const loadPendingRegistration =
      async () => {
        try {
          const res = await fetch(
            API_PROXY_PATHS.googleRegisterPending(),
            {
              method: "GET",
              cache: "no-store",
            },
          );

          if (!res.ok) {
            if (!cancelled) {
              setPageError(
                "Your Google registration session is missing or has expired. Please start again.",
              );
            }
            return;
          }

          const data =
            (await res.json()) as PendingGoogleRegistration;

          if (!cancelled) {
            setPending(data);
          }
        } catch {
          if (!cancelled) {
            setPageError(
              "Unable to load your Google registration. Please try again.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingPending(false);
          }
        }
      };

    void loadPendingRegistration();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (
    values: GoogleRegistrationValues,
  ) => {
    setPageError(null);

    if (
      turnstileEnabled &&
      !turnstileToken
    ) {
      setError("root", {
        message:
          "Please complete the security check before creating your account.",
      });
      return;
    }

    try {
      const res = await fetch(
        API_PROXY_PATHS.googleRegisterComplete(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: values.username,
            accepted: values.accepted,
            turnstile_token: turnstileToken,
          }),
        },
      );

      if (!res.ok) {
        let data: unknown = null;

        try {
          data = await res.json();
        } catch {}

        setTurnstileToken(null);
        setTurnstileResetKey(
          (current) => current + 1,
        );

        setError("root", {
          message: readErrorMessage(
            data,
            "Unable to create your GermFx account.",
          ),
        });

        return;
      }

      const data = await res.json();

      if (data?.user) {
        try {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user),
          );
        } catch {}
      }

      router.replace(
        CLIENT_PATHS.homePath(),
      );
      router.refresh();
    } catch {
      setTurnstileToken(null);
      setTurnstileResetKey(
        (current) => current + 1,
      );

      setError("root", {
        message:
          "Network error. Please try again.",
      });
    }
  };

  return (
    <div className="landing-root min-h-[calc(100vh-57px)]">
      <div
        className="landing-grid pointer-events-none fixed inset-0"
        aria-hidden
      />

      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(210_80%_55%/0.10)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(210_80%_60%/0.12)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex min-h-[calc(100vh-149px)] flex-col items-center justify-center px-2 py-4 sm:px-4 sm:py-16">
        <Link
          href="/"
          className="mb-4 hidden transition-opacity hover:opacity-80 sm:mb-10 sm:block"
        >
          <Image
            src="/logo/germfx-logo.png"
            alt="GermFx"
            width={128}
            height={64}
            priority
          />
        </Link>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:border-[hsl(220_20%_16%)] dark:bg-[hsl(220_28%_9%/0.96)] dark:shadow-black/40">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sky-500 to-transparent dark:via-[hsl(210_80%_62%)]" />

          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 text-center">
              <h1 className="landing-display text-xl font-bold text-slate-950 sm:text-2xl dark:text-[hsl(var(--landing-fg))]">
                Finish setting up GermFx
              </h1>

              <p className="mt-1.5 text-sm text-slate-600 dark:text-[hsl(var(--landing-fg-muted))]">
                Choose a username for your new account
              </p>
            </div>

            {loadingPending ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
                Loading your Google account…
              </div>
            ) : pageError ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-[hsl(0_70%_50%/0.3)] dark:bg-[hsl(0_70%_50%/0.08)] dark:text-[hsl(0_70%_67%)]">
                  {pageError}
                </div>

                <Link
                  href={CLIENT_PATHS.clientRegisterPath()}
                  className="landing-btn-primary block w-full rounded-xl py-3 text-center text-sm font-semibold"
                >
                  Back to registration
                </Link>
              </div>
            ) : pending ? (
              <>
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[hsl(220_20%_18%)] dark:bg-[hsl(220_25%_12%)]">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
                    Google account
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-[hsl(var(--landing-fg))]">
                    {pending.email}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    ✓ Verified by Google
                  </p>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={handleSubmit(
                    onSubmit,
                  )}
                  noValidate
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-[hsl(var(--landing-fg-subtle))]">
                      Username
                    </label>

                    <input
                      type="text"
                      placeholder="cool_user42"
                      aria-label="Username"
                      aria-invalid={Boolean(
                        errors.username,
                      )}
                      autoComplete="username"
                      {...register("username")}
                      className={[
                        inputBase,
                        errors.username
                          ? inputError
                          : inputNormal,
                      ].join(" ")}
                    />

                    <p className="text-xs text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
                      4–20 characters, letters, numbers, and underscores only.
                    </p>

                    {errors.username?.message && (
                      <p className="text-xs text-red-600 dark:text-[hsl(0_70%_67%)]">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 bg-white accent-[hsl(var(--landing-accent))] dark:border-[hsl(220_20%_24%)] dark:bg-[hsl(220_25%_14%)]"
                        aria-invalid={Boolean(
                          errors.accepted,
                        )}
                        {...register("accepted")}
                      />

                      <span className="text-sm leading-snug text-slate-700 dark:text-[hsl(var(--landing-fg-muted))]">
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>

                    {errors.accepted?.message && (
                      <p className="text-xs text-red-600 dark:text-[hsl(0_70%_67%)]">
                        {errors.accepted.message}
                      </p>
                    )}
                  </div>

                  {turnstileEnabled && (
                    <TurnstileWidget
                      action="register"
                      onTokenChange={
                        setTurnstileToken
                      }
                      resetKey={
                        turnstileResetKey
                      }
                      className="flex justify-center"
                    />
                  )}

                  {errors.root?.message && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-[hsl(0_70%_50%/0.3)] dark:bg-[hsl(0_70%_50%/0.08)] dark:text-[hsl(0_70%_67%)]">
                      {errors.root.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (turnstileEnabled &&
                        !turnstileToken)
                    }
                    className="landing-btn-primary w-full cursor-pointer rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Creating account…"
                      : "Create account"}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}