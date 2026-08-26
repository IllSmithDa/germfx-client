"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";


import {
  reactivateAccountClient,
} from "@/lib/client/reactivationApi";
import { startGoogleAccountReactivation } from "@/lib/helpers/googleReactivateClient";

type ReactivateAccountFormValues = {
  identifier: string;
  password: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const inputBase =
  "w-full rounded-xl border bg-[hsl(220_25%_12%)] px-4 py-3 text-sm text-[hsl(210_30%_94%)] placeholder:text-[hsl(215_14%_38%)] outline-none transition-all";
const inputNormal =
  "border-[hsl(220_20%_20%)] focus:border-[hsl(210_80%_62%/0.6)] focus:ring-2 focus:ring-[hsl(210_80%_62%/0.2)]";
const inputError =
  "border-[hsl(0_70%_55%/0.7)] focus:ring-2 focus:ring-[hsl(0_70%_55%/0.2)]";

const GOOGLE_REACTIVATION_ERRORS: Record<
  string,
  string
> = {
  GOOGLE_REACTIVATION_ACCOUNT_NOT_FOUND:
    "No GermFx account is linked to that Google account. Try another Google account or use your GermFx password.",
  GOOGLE_LINKED_USER_NOT_FOUND:
    "The GermFx account linked to that Google account could not be found.",
  ACCOUNT_SUSPENDED:
    "This account has been suspended and cannot be reactivated here.",
  ACCOUNT_REACTIVATION_NOT_ALLOWED:
    "This account cannot be reactivated through this recovery flow.",
  GOOGLE_OAUTH_DENIED:
    "Google account reactivation was cancelled or denied.",
  GOOGLE_OAUTH_STATE_INVALID:
    "Your Google reactivation session expired or could not be verified. Please try again.",
  GOOGLE_AUTHORIZATION_CODE_MISSING:
    "Google did not return the information needed to complete reactivation. Please try again.",
  GOOGLE_TOKEN_EXCHANGE_FAILED:
    "Google reactivation could not be completed. Please try again.",
  GOOGLE_ID_TOKEN_INVALID:
    "Google could not verify your identity. Please try again.",
  GOOGLE_EMAIL_NOT_VERIFIED:
    "Your Google email address must be verified before it can be used.",
  GOOGLE_OAUTH_NOT_CONFIGURED:
    "Google account reactivation is temporarily unavailable.",
  GOOGLE_OAUTH_UNAVAILABLE:
    "Google account reactivation is temporarily unavailable. Please try again.",
  GOOGLE_OAUTH_INTENT_INVALID:
    "The Google reactivation request was invalid. Please try again.",
  GOOGLE_OAUTH_ERROR:
    "Unable to reactivate your account with Google. Please try again.",
};

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
      {children}
    </label>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p className="text-xs text-[hsl(0_70%_62%)]">
      {message}
    </p>
  );
}

function Feedback({
  state,
}: {
  state: FeedbackState;
}) {
  if (!state) return null;

  return (
    <div
      className={[
        "rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : "border-[hsl(0_70%_50%/0.3)] bg-[hsl(0_70%_50%/0.08)] text-[hsl(0_70%_62%)]",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
    >
      <path
        fill="currentColor"
        d="M21.35 12.2c0-.72-.06-1.25-.2-1.8H12v3.48h5.37a4.6 4.6 0 0 1-2 3.04l-.03.12 2.91 2.25.2.02c1.84-1.7 2.9-4.2 2.9-7.1Z"
      />
      <path
        fill="currentColor"
        opacity=".75"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.39l-3.08-2.39c-.82.55-1.92.94-3.37.94-2.53 0-4.68-1.7-5.45-4.05l-.11.01-3.03 2.35-.04.11A9.73 9.73 0 0 0 12 21.7Z"
      />
      <path
        fill="currentColor"
        opacity=".55"
        d="M6.55 13.81A5.84 5.84 0 0 1 6.23 12c0-.63.11-1.24.31-1.81v-.13L3.47 7.67l-.1.05A9.7 9.7 0 0 0 2.3 12c0 1.54.37 3 .99 4.28l3.26-2.47Z"
      />
      <path
        fill="currentColor"
        opacity=".9"
        d="M12 6.14c1.83 0 3.06.79 3.76 1.44l2.76-2.69A9.32 9.32 0 0 0 12 2.3a9.73 9.73 0 0 0-8.63 5.42l3.17 2.47C7.32 7.84 9.47 6.14 12 6.14Z"
      />
    </svg>
  );
}

export default function ReactivateAccountForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);
  const [pending, setPending] =
    useState(false);
  const [googlePending, setGooglePending] =
    useState(false);
  const [feedback, setFeedback] =
    useState<FeedbackState>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReactivateAccountFormValues>({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    const url = new URL(
      window.location.href,
    );

    const oauthError =
      url.searchParams.get(
        "oauth_error",
      );

    if (!oauthError) return;

    setFeedback({
      ok: false,
      message:
        GOOGLE_REACTIVATION_ERRORS[
          oauthError
        ] ??
        GOOGLE_REACTIVATION_ERRORS
          .GOOGLE_OAUTH_ERROR,
    });

    url.searchParams.delete(
      "oauth_error",
    );

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  async function onSubmit(
    values: ReactivateAccountFormValues,
  ) {
    setPending(true);
    setFeedback(null);

    try {
      const result =
        await reactivateAccountClient(
          values,
        );

      setFeedback({
        ok: result.ok,
        message: result.message,
      });

      if (result.ok) {
        setTimeout(() => {
          router.replace("/home");
          router.refresh();
        }, 1200);
      }
    } finally {
      setPending(false);
    }
  }

  function reactivateWithGoogle() {
    setFeedback(null);
    setGooglePending(true);

    startGoogleAccountReactivation();
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-5"
        onSubmit={handleSubmit(
          onSubmit,
        )}
        noValidate
      >
        <div className="rounded-xl border border-[hsl(210_80%_62%/0.25)] bg-[hsl(210_80%_62%/0.08)] px-4 py-3 text-sm text-[hsl(var(--landing-fg-muted))]">
          If your GermFx account has a
          password, use your email or
          username and current password to
          reactivate it.
        </div>

        <div className="space-y-1.5">
          <FieldLabel>
            Email or username
          </FieldLabel>

          <input
            type="text"
            placeholder="you@email.com or username"
            autoComplete="username"
            {...register(
              "identifier",
              {
                required:
                  "Email or username is required",
                minLength: {
                  value: 3,
                  message:
                    "Enter your email or username",
                },
              },
            )}
            className={[
              inputBase,
              errors.identifier
                ? inputError
                : inputNormal,
            ].join(" ")}
          />

          <FieldError
            message={
              errors.identifier
                ?.message
            }
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>
            Password
          </FieldLabel>

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              autoComplete="current-password"
              {...register(
                "password",
                {
                  required:
                    "Password is required",
                  minLength: {
                    value: 1,
                    message:
                      "Password is required",
                  },
                },
              )}
              className={[
                inputBase,
                "pr-20",
                errors.password
                  ? inputError
                  : inputNormal,
              ].join(" ")}
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
                  (prev) => !prev,
                )
              }
              className="absolute inset-y-0 right-3 inline-flex cursor-pointer items-center gap-1 text-xs text-[hsl(var(--landing-fg-subtle))] transition-colors hover:text-[hsl(var(--landing-fg-muted))] focus:outline-none"
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

          <FieldError
            message={
              errors.password?.message
            }
          />
        </div>

        <Feedback
          state={feedback}
        />

        <button
          type="submit"
          disabled={
            pending ||
            googlePending
          }
          className="landing-btn-primary w-full cursor-pointer rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Reactivating..."
            : "Reactivate Account"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[hsl(220_20%_20%)]" />
        <span className="text-xs uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
          or
        </span>
        <div className="h-px flex-1 bg-[hsl(220_20%_20%)]" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled={
            pending ||
            googlePending
          }
          onClick={
            reactivateWithGoogle
          }
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[hsl(220_20%_24%)] bg-[hsl(220_25%_12%)] px-4 py-3 text-sm font-semibold text-[hsl(var(--landing-fg))] transition hover:bg-[hsl(220_25%_15%)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />

          {googlePending
            ? "Opening Google..."
            : "Reactivate with Google"}
        </button>

        <p className="text-center text-xs leading-relaxed text-[hsl(var(--landing-fg-subtle))]">
          Use this if your GermFx account
          was created with Google or is
          already linked to Google.
        </p>
      </div>

      <p className="text-center text-sm text-[hsl(var(--landing-fg-subtle))]">
        Back to{" "}
        <Link
          href="/login"
          className="font-medium text-[hsl(var(--landing-accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          login
        </Link>
      </p>
    </div>
  );
}