"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GoogleAuthButton from "@/components/Auth/GoogleAuthButton/GoogleAuthButton";
import TurnstileWidget from "@/components/Turnstile/TurnstileWidget";
import { CLIENT_PATHS } from "@/config/paths";

const LoginSchema = z.object({
  identifier: z.string().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all dark:bg-[hsl(220_25%_12%)] dark:text-[hsl(210_30%_94%)] dark:placeholder:text-[hsl(215_14%_48%)]";
const inputNormal =
  "border-slate-300 hover:border-slate-400 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20 dark:border-[hsl(220_20%_20%)] dark:hover:border-[hsl(220_16%_30%)] dark:focus:border-[hsl(210_80%_62%/0.6)] dark:focus:ring-[hsl(210_80%_62%/0.2)]";
const inputError =
  "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-[hsl(0_70%_55%/0.7)] dark:focus:ring-[hsl(0_70%_55%/0.2)]";

type GoogleOAuthErrorInfo = {
  message: string;
  showRegister?: boolean;
  showReactivate?: boolean;
};

const GOOGLE_OAUTH_ERRORS: Record<string, GoogleOAuthErrorInfo> = {
  ACCOUNT_DEACTIVATED: {
    message:
      "This GermFx account is deactivated. Reactivate it before signing in.",
    showReactivate: true,
  },
  GOOGLE_ACCOUNT_NOT_FOUND: {
    message:
      "No existing GermFx account matches this Google account. Create an account first, then try signing in with Google again.",
    showRegister: true,
  },
  GOOGLE_EMAIL_NOT_VERIFIED: {
    message:
      "Your Google email address must be verified before you can use it to sign in.",
  },
  GOOGLE_ACCOUNT_ALREADY_LINKED: {
    message:
      "This GermFx account is already linked to a different Google account.",
  },
  GOOGLE_OAUTH_DENIED: {
    message:
      "Google sign-in was cancelled or denied.",
  },
  GOOGLE_OAUTH_STATE_INVALID: {
    message:
      "Your Google sign-in session expired or could not be verified. Please try again.",
  },
  GOOGLE_AUTHORIZATION_CODE_MISSING: {
    message:
      "Google did not return a valid sign-in response. Please try again.",
  },
  GOOGLE_TOKEN_EXCHANGE_FAILED: {
    message:
      "Google sign-in could not be completed. Please try again.",
  },
  GOOGLE_ID_TOKEN_INVALID: {
    message:
      "Google could not verify your identity. Please try signing in again.",
  },
  GOOGLE_OAUTH_NOT_CONFIGURED: {
    message:
      "Google sign-in is temporarily unavailable.",
  },
  GOOGLE_OAUTH_UNAVAILABLE: {
    message:
      "Google sign-in is temporarily unavailable. Please try again.",
  },
  GOOGLE_OAUTH_ERROR: {
    message:
      "Unable to sign in with Google. Please try again.",
  },
};

function getGoogleOAuthError(
  code: string | null,
): GoogleOAuthErrorInfo | null {
  if (!code) return null;

  return (
    GOOGLE_OAUTH_ERRORS[code] ??
    GOOGLE_OAUTH_ERRORS.GOOGLE_OAUTH_ERROR
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showReactivateAccount, setShowReactivateAccount] = useState(false);
  const [googleOAuthError, setGoogleOAuthError] =
    useState<GoogleOAuthErrorInfo | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  const [rememberEmail, setRememberEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("sidefx_email"));
    }

    return false;
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("sidefx_email");

    if (savedEmail) {
      setValue("identifier", savedEmail);
      setRememberEmail(true);
    }

    const url = new URL(window.location.href);
    const oauthErrorCode =
      url.searchParams.get("oauth_error");

    if (oauthErrorCode) {
      setGoogleOAuthError(
        getGoogleOAuthError(oauthErrorCode),
      );

      // The message stays in component state, while the URL is cleaned so
      // refreshing the page does not repeatedly show a stale OAuth error.
      url.searchParams.delete("oauth_error");

      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  }, [setValue]);

  const onSubmit = async (values: LoginValues) => {
    setShowResendVerification(false);
    setShowReactivateAccount(false);
    setGoogleOAuthError(null);

    if (turnstileEnabled && !turnstileToken) {
      setError("root", {
        message: "Please complete the security check before signing in.",
      });
      return;
    }

    if (rememberEmail) {
      localStorage.setItem("sidefx_email", values.identifier);
    } else {
      localStorage.removeItem("sidefx_email");
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
          turnstile_token: turnstileToken,
        }),
      });

      if (!res.ok) {
        let detail = "Login failed.";
        let errorCode: string | null = null;

        try {
          const data = await res.json();

          if (typeof data?.detail === "string") {
            detail = data.detail;
          } else if (data?.detail && typeof data.detail === "object") {
            detail = data.detail.message || detail;
            errorCode = data.detail.code || null;
          } else if (Array.isArray(data?.detail)) {
            detail = data.detail[0]?.msg || detail;
          }
        } catch {}

        if (errorCode === "EMAIL_NOT_VERIFIED") {
          setShowResendVerification(true);
        }

        if (errorCode === "ACCOUNT_DEACTIVATED") {
          setShowReactivateAccount(true);
        }

        const normalizedDetail =
          typeof detail === "string" ? detail.toLowerCase() : "";

        if (!errorCode) {
          if (
            normalizedDetail.includes("verify your email") ||
            normalizedDetail.includes("email verification") ||
            normalizedDetail.includes("email verified")
          ) {
            setShowResendVerification(true);
          }

          if (
            normalizedDetail.includes("deactivated") ||
            normalizedDetail.includes("reactivate it") ||
            normalizedDetail.includes("reactivate your account")
          ) {
            setShowReactivateAccount(true);
          }
        }

        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
        setError("root", { message: detail });
        return;
      }

      const data = await res.json();

      try {
        localStorage.setItem("user", JSON.stringify(data));
      } catch {}

      window.location.href = CLIENT_PATHS.homePath();
    } catch {
      setTurnstileToken(null);
      setTurnstileResetKey((current) => current + 1);
      setError("root", { message: "Network error. Please try again." });
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

      <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-2 py-4 sm:px-4 sm:py-16">
        <Link
          href="/"
          className="hidden sm:block landing-display mb-10 text-2xl font-bold text-slate-950 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-fg))]"
        >
          <Image
            src="/logo/germfx-logo.png"
            alt="SideFX"
            width={128}
            height={64}
            priority
          />
        </Link>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:border-[hsl(220_20%_16%)] dark:bg-[hsl(220_28%_9%/0.96)] dark:shadow-black/40">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sky-500 to-transparent dark:via-[hsl(210_80%_62%)]" />

          <div className="px-2 py-4 sm:py-8 sm:px-8">
            <div className="mb-4 sm:mb-8 text-center">
              <h1 className="landing-display text-lg sm:text-2xl font-bold text-slate-950 dark:text-[hsl(var(--landing-fg))]">
                Welcome
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-[hsl(var(--landing-fg-muted))]">
                Sign in to continue tracking your health
              </p>
            </div>

            {googleOAuthError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-[hsl(0_70%_50%/0.3)] dark:bg-[hsl(0_70%_50%/0.08)]">
                <div className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-[hsl(0_70%_67%)]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M8 2L1.5 13.5h13L8 2z" />
                    <line
                      x1="8"
                      y1="7"
                      x2="8"
                      y2="10"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="8"
                      cy="12"
                      r="0.5"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>

                  <div className="min-w-0">
                    <p className="text-sm text-red-700 dark:text-[hsl(0_70%_67%)]">
                      {googleOAuthError.message}
                    </p>

                    {googleOAuthError.showRegister && (
                      <Link
                        href={CLIENT_PATHS.clientRegisterPath()}
                        className="mt-2 inline-flex text-sm font-semibold text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                      >
                        Create a GermFx account
                      </Link>
                    )}

                    {googleOAuthError.showReactivate && (
                      <Link
                        href="/reactivate-account"
                        className="mt-2 inline-flex text-sm font-semibold text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                      >
                        Reactivate account
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form
              className="space-y-3 sm:space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-[hsl(var(--landing-fg-subtle))]">
                  Email or username
                </label>
                <input
                  type="text"
                  placeholder="you@email.com or username"
                  aria-label="Email or username"
                  aria-invalid={Boolean(errors.identifier)}
                  autoComplete="username"
                  {...register("identifier")}
                  className={[
                    inputBase,
                    errors.identifier ? inputError : inputNormal,
                  ].join(" ")}
                />
                {errors.identifier && (
                  <p className="text-xs text-red-600 dark:text-[hsl(0_70%_67%)]">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-[hsl(var(--landing-fg-subtle))]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-label="Password"
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="current-password"
                    {...register("password")}
                    className={[
                      inputBase,
                      "pr-20",
                      errors.password ? inputError : inputNormal,
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-800 focus:outline-none dark:text-[hsl(var(--landing-fg-subtle))] dark:hover:text-[hsl(var(--landing-fg-muted))]"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Show
                      </>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-[hsl(0_70%_67%)]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {"root" in errors && errors.root?.message && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-[hsl(0_70%_50%/0.3)] dark:bg-[hsl(0_70%_50%/0.08)]">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-[hsl(0_70%_67%)]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 2L1.5 13.5h13L8 2z" />
                    <line
                      x1="8"
                      y1="7"
                      x2="8"
                      y2="10"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="8"
                      cy="12"
                      r="0.5"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-[hsl(0_70%_67%)]">
                    {errors.root.message}
                  </p>
                </div>
              )}

              {showResendVerification && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-[hsl(210_80%_62%/0.25)] dark:bg-[hsl(210_80%_62%/0.08)]">
                  <p className="text-sm text-slate-700 dark:text-[hsl(var(--landing-fg-muted))]">
                    Need another verification email?{" "}
                    <Link
                      href="/verify-email/resend"
                      className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                    >
                      Resend verification
                    </Link>
                  </p>
                </div>
              )}

              {showReactivateAccount && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-[hsl(210_80%_62%/0.25)] dark:bg-[hsl(210_80%_62%/0.08)]">
                  <p className="text-sm text-slate-700 dark:text-[hsl(var(--landing-fg-muted))]">
                    This account is deactivated.{" "}
                    <Link
                      href="/reactivate-account"
                      className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                    >
                      Reactivate account
                    </Link>
                  </p>
                </div>
              )}

              {turnstileEnabled && (
                <div className="pt-1">
                  <TurnstileWidget
                    action="login"
                    onTokenChange={setTurnstileToken}
                    resetKey={turnstileResetKey}
                    className="flex justify-center"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="landing-btn-primary mt-1 w-full cursor-pointer rounded-xl py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--landing-accent))] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-[hsl(220_28%_9%)]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg
                      className="h-3.5 w-3.5 animate-spin"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeOpacity="0.3"
                      />
                      <path
                        d="M8 2a6 6 0 0 1 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-[hsl(var(--landing-fg-muted))]">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(event) => setRememberEmail(event.target.checked)}
                    className="h-3 sm:h-4 sm:w-4 rounded border-slate-300 bg-white accent-[hsl(var(--landing-accent))] dark:border-slate-600 dark:bg-[hsl(220_25%_12%)]"
                  />
                  Remember my email
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-accent))]"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
              Deactivated your account?{" "}
              <Link
                href="/reactivate-account"
                className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 focus:outline-none dark:text-[hsl(var(--landing-accent))]"
              >
                Reactivate it
              </Link>
            </p>

            <p className="mt-3 text-center text-sm text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
              Don&apos;t have an account?{" "}
              <Link
                href={CLIENT_PATHS.clientRegisterPath()}
                className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 focus:outline-none dark:text-[hsl(var(--landing-accent))]"
              >
                Sign up free
              </Link>
            </p>
          </div>

          <GoogleAuthButton mode="login" />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
          For personal tracking only — not medical advice.
        </p>
      </div>
    </div>
  );
}