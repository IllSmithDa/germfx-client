"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { resendVerificationClient } from "@/lib/client/verificationApi";
import TurnstileWidget from "@/components/Turnstile/TurnstileWidget";

type ResendVerificationFormValues = {
  email: string;
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[hsl(0_70%_62%)]">{message}</p>;
}

function Feedback({ state }: { state: FeedbackState }) {
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

export default function ResendVerificationForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormValues>({
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ResendVerificationFormValues) {
    setFeedback(null);

    if (turnstileEnabled && !turnstileToken) {
      setFeedback({
        ok: false,
        message: "Please complete the security check before resending the verification email.",
      });
      return;
    }

    setPending(true);

    const payload = {
      email: values.email,
      turnstile_token: turnstileToken,
    };

    try {
      const result = await resendVerificationClient(payload);
      setFeedback({ ok: result.ok, message: result.message });
    } catch {
      setFeedback({
        ok: false,
        message: "Unable to resend the verification email. Please try again.",
      });
    } finally {
      // Turnstile tokens are single-use. Reset after every request so a
      // subsequent resend attempt must receive a fresh token.
      if (turnstileEnabled) {
        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
      }

      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1.5">
        <FieldLabel>Email</FieldLabel>
        <input
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
          })}
          className={[inputBase, errors.email ? inputError : inputNormal].join(" ")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {turnstileEnabled && (
        <div className="pt-1">
          <TurnstileWidget
            action="resend_verification"
            onTokenChange={setTurnstileToken}
            resetKey={turnstileResetKey}
            className="flex justify-center"
          />
        </div>
      )}

      <Feedback state={feedback} />

      <button
        type="submit"
        disabled={pending}
        className="landing-btn-primary w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending..." : "Resend Verification Email"}
      </button>

      <p className="text-center text-sm text-[hsl(var(--landing-fg-subtle))]">
        Back to{" "}
        <Link
          href="/login"
          className="font-medium text-[hsl(var(--landing-accent))] underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          login
        </Link>
      </p>
    </form>
  );
}