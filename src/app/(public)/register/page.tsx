"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GoogleAuthButton from "@/components/Auth/GoogleAuthButton/GoogleAuthButton";
import TurnstileWidget from "@/components/Turnstile/TurnstileWidget";
import { CLIENT_PATHS, SERVER_PATHS } from "@/config/paths";

const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(4, "Username must be at least 4 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
    email: z.email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
    accepted: z.boolean().refine((value) => value === true, {
      message: "You must agree to the Terms & Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof RegisterSchema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all dark:bg-[hsl(220_25%_12%)] dark:text-[hsl(210_30%_94%)] dark:placeholder:text-[hsl(215_14%_48%)]";
const inputNormal =
  "border-slate-300 hover:border-slate-400 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20 dark:border-[hsl(220_20%_20%)] dark:hover:border-[hsl(220_16%_30%)] dark:focus:border-[hsl(210_80%_62%/0.6)] dark:focus:ring-[hsl(210_80%_62%/0.2)]";
const inputError =
  "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-[hsl(0_70%_55%/0.7)] dark:focus:ring-[hsl(0_70%_55%/0.2)]";

const GOOGLE_REGISTER_OAUTH_ERRORS: Record<string, string> = {
  GOOGLE_OAUTH_DENIED:
    "Google registration was cancelled or denied.",
  GOOGLE_OAUTH_STATE_INVALID:
    "Your Google registration session expired or could not be verified. Please try again.",
  GOOGLE_EMAIL_NOT_VERIFIED:
    "Your Google email address must be verified before you can create a GermFx account.",
  GOOGLE_ID_TOKEN_INVALID:
    "Google could not verify your identity. Please try again.",
  GOOGLE_TOKEN_EXCHANGE_FAILED:
    "Google registration could not be completed. Please try again.",
  GOOGLE_OAUTH_NOT_CONFIGURED:
    "Google registration is temporarily unavailable.",
  GOOGLE_OAUTH_UNAVAILABLE:
    "Google registration is temporarily unavailable. Please try again.",
  GOOGLE_OAUTH_INTENT_INVALID:
    "The Google registration request was invalid. Please try again.",
  GOOGLE_OAUTH_ERROR:
    "Unable to continue registration with Google. Please try again.",
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-[hsl(var(--landing-fg-subtle))]">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
      {children}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-xs text-red-600 dark:text-[hsl(0_70%_67%)]">
      {message}
    </p>
  );
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={show ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="absolute inset-y-0 right-3 inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-800 focus:outline-none dark:text-[hsl(var(--landing-fg-subtle))] dark:hover:text-[hsl(var(--landing-fg-muted))]"
    >
      {show ? (
        <>
          <EyeOff className="h-3.5 w-3.5" /> Hide
        </>
      ) : (
        <>
          <Eye className="h-3.5 w-3.5" /> Show
        </>
      )}
    </button>
  );
}

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleOAuthError, setGoogleOAuthError] =
    useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      accepted: false,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("oauth_error");

    if (!code) return;

    setGoogleOAuthError(
      GOOGLE_REGISTER_OAUTH_ERRORS[code] ??
        GOOGLE_REGISTER_OAUTH_ERRORS.GOOGLE_OAUTH_ERROR,
    );

    url.searchParams.delete("oauth_error");

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  const onSubmit = async (values: RegisterValues) => {
    setGoogleOAuthError(null);
    if (turnstileEnabled && !turnstileToken) {
      setError("root", {
        message:
          "Please complete the security check before creating your account.",
      });
      return;
    }

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      turnstile_token: turnstileToken,
    };

    try {
      const res = await fetch(SERVER_PATHS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = "Registration failed.";

        try {
          const data = await res.json();

          if (typeof data?.detail === "string") {
            detail = data.detail;
          } else if (data?.detail && typeof data.detail === "object") {
            detail = data.detail.message || detail;
          } else if (Array.isArray(data?.detail)) {
            detail = data.detail[0]?.msg || detail;
          } else if (typeof data?.message === "string") {
            detail = data.message;
          }
        } catch {}

        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
        setError("root", { message: detail });
        return;
      }

      const params = new URLSearchParams({
        email: values.email,
        username: values.username,
      });

      router.push(`/register/success?${params.toString()}`);
    } catch {
      setTurnstileToken(null);
      setTurnstileResetKey((current) => current + 1);

      setError("root", {
        message: "Network error. Please try again.",
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

      <div className="relative flex min-h-[calc(100vh-149px)] flex-col items-center justify-center sm:px-4 sm:py-16 px-2 py-4">
        <Link
          href="/"
          className="hidden sm:block landing-display mb-4 sm:mb-10 text-2xl font-bold text-slate-950 transition-opacity hover:opacity-80 dark:text-[hsl(var(--landing-fg))]"
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

          <div className="py-3 sm:py-8 px-2  sm:px-8">
            <div className="sm:mb-8 mb-2 text-center">
              <h1 className="landing-display text-md sm:text-2xl font-bold text-slate-950 dark:text-[hsl(var(--landing-fg))]">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-[hsl(var(--landing-fg-muted))]">
                Free to use — start tracking in minutes
              </p>
            </div>

            {googleOAuthError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-[hsl(0_70%_50%/0.3)] dark:bg-[hsl(0_70%_50%/0.08)] dark:text-[hsl(0_70%_67%)]">
                {googleOAuthError}
              </div>
            )}

            <form
              className="space-y-3 sm:space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-1.5">
                <FieldLabel>Username</FieldLabel>
                <input
                  type="text"
                  placeholder="cool_user42"
                  aria-label="Username"
                  aria-invalid={Boolean(errors.username)}
                  autoComplete="username"
                  {...register("username")}
                  className={[
                    inputBase,
                    errors.username ? inputError : inputNormal,
                  ].join(" ")}
                />
                <FieldHint>
                  4–20 characters, letters, numbers, and underscores only.
                </FieldHint>
                <FieldError message={errors.username?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  placeholder="you@email.com"
                  aria-label="Email"
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  {...register("email")}
                  className={[
                    inputBase,
                    errors.email ? inputError : inputNormal,
                  ].join(" ")}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Password</FieldLabel>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-label="Password"
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="new-password"
                    {...register("password")}
                    className={[
                      inputBase,
                      "pr-20",
                      errors.password ? inputError : inputNormal,
                    ].join(" ")}
                  />
                  <PasswordToggle
                    show={showPassword}
                    onToggle={() =>
                      setShowPassword((current) => !current)
                    }
                  />
                </div>
                <FieldHint>At least 8 characters.</FieldHint>
                <FieldError message={errors.password?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Confirm password</FieldLabel>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    aria-label="Confirm password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={[
                      inputBase,
                      "pr-20",
                      errors.confirmPassword ? inputError : inputNormal,
                    ].join(" ")}
                  />
                  <PasswordToggle
                    show={showConfirm}
                    onToggle={() => setShowConfirm((current) => !current)}
                  />
                </div>
                <FieldError message={errors.confirmPassword?.message} />
              </div>

              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 bg-white accent-[hsl(var(--landing-accent))] dark:border-[hsl(220_20%_24%)] dark:bg-[hsl(220_25%_14%)]"
                    aria-invalid={Boolean(errors.accepted)}
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
                <FieldError message={errors.accepted?.message} />
              </div>

              {turnstileEnabled && (
                <div className="pt-1">
                  <TurnstileWidget
                    action="register"
                    onTokenChange={setTurnstileToken}
                    resetKey={turnstileResetKey}
                    className="flex justify-center"
                  />
                </div>
              )}

              {errors.root?.message && (
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

              <button
                type="submit"
                disabled={
                  isSubmitting || (turnstileEnabled && !turnstileToken)
                }
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
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
              Already have an account?{" "}
              <Link
                href={CLIENT_PATHS.clientLoginPath()}
                className="font-medium text-sky-700 underline underline-offset-2 transition-opacity hover:opacity-80 focus:outline-none dark:text-[hsl(var(--landing-accent))]"
              >
                Sign in
              </Link>
            </p>
          </div>

          <GoogleAuthButton mode="register" />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-[hsl(var(--landing-fg-subtle))]">
          Your data is private and never sold.
        </p>
      </div>
    </div>
  );
}