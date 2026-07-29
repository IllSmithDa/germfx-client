// src/components/Auth/ForgotPasswordForm.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import TurnstileWidget from "@/components/Turnstile/TurnstileWidget";
import { forgotPasswordClient } from "@/lib/client/resetPasswordApi";
import AuthCooldownNotice from "../Auth/AuthCooldownNotice";

type ForgotPasswordFormValues = {
  email: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const FORGOT_PASSWORD_COOLDOWN_SECONDS = 60;
const FORGOT_PASSWORD_COOLDOWN_STORAGE_KEY =
  "sidefx_forgot_password_cooldown_until";

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50]";

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null;

  return (
    <div
      className={[
        "rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-400/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-rose-400/40 bg-rose-500/8 text-rose-700 dark:text-rose-400",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function getStoredCooldownUntil() {
  if (typeof window === "undefined") {
    return 0;
  }

  const rawValue = window.localStorage.getItem(
    FORGOT_PASSWORD_COOLDOWN_STORAGE_KEY,
  );

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getSecondsRemaining(cooldownUntil: number) {
  if (!cooldownUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
}

export default function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  const cooldownActive = secondsRemaining > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    const storedCooldownUntil = getStoredCooldownUntil();

    setCooldownUntil(storedCooldownUntil);
    setSecondsRemaining(getSecondsRemaining(storedCooldownUntil));
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const updateRemainingTime = () => {
      const remaining = getSecondsRemaining(cooldownUntil);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        window.localStorage.removeItem(FORGOT_PASSWORD_COOLDOWN_STORAGE_KEY);
        setCooldownUntil(0);
      }
    };

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownUntil]);

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileResetKey((current) => current + 1);
  }

  function startCooldown() {
    const nextCooldownUntil =
      Date.now() + FORGOT_PASSWORD_COOLDOWN_SECONDS * 1000;

    window.localStorage.setItem(
      FORGOT_PASSWORD_COOLDOWN_STORAGE_KEY,
      String(nextCooldownUntil),
    );

    setCooldownUntil(nextCooldownUntil);
    setSecondsRemaining(FORGOT_PASSWORD_COOLDOWN_SECONDS);
  }

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFeedback(null);
    clearErrors("root");

    if (cooldownActive) {
      setError("root", {
        message: `Please wait ${secondsRemaining} seconds before requesting another reset link.`,
      });
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError("root", {
        message: "Please complete the security check before continuing.",
      });
      return;
    }

    setPending(true);

    try {
      const result = await forgotPasswordClient({
        email: values.email,
        turnstile_token: turnstileToken,
      });

      setFeedback({ ok: result.ok, message: result.message });

      if (result.ok) {
        startCooldown();
      }

      resetTurnstile();
    } catch {
      setFeedback({
        ok: false,
        message: "Unable to send reset link. Please try again.",
      });

      resetTurnstile();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Email
        </span>

        <input
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          className={inputClass}
          disabled={pending || cooldownActive}
          {...register("email", {
            required: "Email is required",
          })}
        />

        {errors.email?.message ? (
          <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
            {errors.email.message}
          </p>
        ) : null}
      </label>

      {turnstileEnabled ? (
        <div className="pt-1">
          <TurnstileWidget
            action="forgot_password"
            onTokenChange={setTurnstileToken}
            resetKey={turnstileResetKey}
            className="flex justify-center"
          />
        </div>
      ) : null}

      <AuthCooldownNotice
        secondsRemaining={secondsRemaining}
        title="Reset link recently requested"
        message="Please check your email before requesting another password reset link."
      />

      {errors.root?.message ? (
        <p className="text-sm text-[hsl(var(--destructive))]">
          {errors.root.message}
        </p>
      ) : null}

      <Feedback state={feedback} />

      <button
        type="submit"
        disabled={
          pending ||
          cooldownActive ||
          (turnstileEnabled && !turnstileToken)
        }
        className="inline-flex w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Sending..."
          : cooldownActive
            ? `Try again in ${secondsRemaining}s`
            : "Send Reset Link"}
      </button>

      <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        <Link
          href="/login"
          className="font-medium text-[hsl(var(--foreground))] hover:underline"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}