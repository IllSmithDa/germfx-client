"use client";

import Link from "next/link";
import { useState } from "react";

type VerificationState = "idle" | "loading" | "success" | "error";

type VerifyEmailChangeClientProps = {
  token: string;
};

type VerifyEmailChangeResponse = {
  message?: string;
};

function CheckIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="8" cy="8" r="6" />
      <polyline
        points="5,8 7,10 11,6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M8 2L1.5 13.5h13L8 2z" />
      <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      className="h-7 w-7 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

async function safeJson(response: Response): Promise<VerifyEmailChangeResponse> {
  try {
    return (await response.json()) as VerifyEmailChangeResponse;
  } catch {
    return {};
  }
}

export default function VerifyEmailChangeClient({
  token,
}: VerifyEmailChangeClientProps) {


  const [state, setState] = useState<VerificationState>("idle");
  const [message, setMessage] = useState(
    "Click the button below to confirm your email change.",
  );

  async function handleVerifyEmailChange() {
    if (state === "loading") {
      return;
    }

    if (!token) {
      setState("error");
      setMessage("Missing email change verification token.");
      return;
    }

    setState("loading");
    setMessage("Confirming your email change...");

    try {
      const response = await fetch("/api/auth/verify-email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ token }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setState("error");
        setMessage(data.message || "Unable to verify this email change link.");
        return;
      }

      setState("success");
      setMessage(
        data.message ||
          "Email changed successfully. Please log in again with your new email.",
      );
    } catch {
      setState("error");
      setMessage(
        "Unable to connect to the email verification service. Please try again.",
      );
    }
  }

  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="landing-root min-h-[calc(100vh-57px)]">
      <div
        className="landing-grid pointer-events-none fixed inset-0"
        aria-hidden
      />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, hsl(210 80% 60% / 0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="landing-display mb-10 text-2xl font-bold text-[hsl(var(--landing-fg))] transition-opacity hover:opacity-80"
        >
          Side<span className="text-[hsl(var(--landing-accent))]">FX</span>.ai
        </Link>

        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(220_20%_16%)] bg-[hsl(220_28%_9%)] shadow-2xl shadow-black/40">
          <div
            className="h-0.5 w-full"
            style={{
              background: isError
                ? "linear-gradient(90deg, transparent, hsl(0 70% 60%), transparent)"
                : "linear-gradient(90deg, transparent, hsl(210 80% 62%), transparent)",
            }}
          />

          <div className="px-8 py-8">
            <div
              className={[
                "mx-auto flex h-14 w-14 items-center justify-center rounded-full border",
                isSuccess
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
                  : isError
                    ? "border-rose-400/30 bg-rose-500/10 text-rose-400"
                    : "border-sky-400/30 bg-sky-500/10 text-sky-400",
              ].join(" ")}
            >
              {isSuccess ? (
                <CheckIcon />
              ) : isError ? (
                <WarningIcon />
              ) : (
                <LoadingIcon />
              )}
            </div>

            <div className="mt-5 text-center">
              <h1 className="landing-display text-2xl font-bold text-[hsl(var(--landing-fg))]">
                {isSuccess
                  ? "Email changed"
                  : isError
                    ? "Email change failed"
                    : "Verifying email change"}
              </h1>

              <p className="mt-2 text-sm text-[hsl(var(--landing-fg-muted))]">
                {isSuccess
                  ? "Your SideFX account email has been updated."
                  : isError
                    ? "We could not complete this email change."
                    : "Please wait while we confirm this verification link."}
              </p>
            </div>

            <div
              className={[
                "mt-8 rounded-2xl border p-5 text-sm",
                isSuccess
                  ? "border-[hsl(220_20%_18%)] bg-[hsl(220_25%_12%)] text-[hsl(var(--landing-fg-muted))]"
                  : isError
                    ? "border-rose-400/20 bg-rose-500/8 text-rose-200"
                    : "border-sky-400/20 bg-sky-500/8 text-sky-100",
              ].join(" ")}
            >
              {message}

              {isSuccess ? (
                <p className="mt-3">
                  For your security, existing sessions may have been signed out.
                  Please log in again with your new email address.
                </p>
              ) : null}
              
            </div>

            <div className="mt-8 flex justify-center">
              {!isSuccess ? (
                <button
                  type="button"
                  onClick={handleVerifyEmailChange}
                  disabled={state === "loading"}
                  className="landing-btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {state === "loading" ? "Confirming..." : "Confirm Email Change"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="landing-btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
                >
                  Continue to Login
                </Link>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[hsl(var(--landing-fg-subtle))]">
          Your data is private and never sold.
        </p>
      </div>
    </div>
  );
}