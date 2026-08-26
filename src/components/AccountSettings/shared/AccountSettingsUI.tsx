"use client";

import {
  useState,
} from "react";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { FeedbackState, VerificationMethod } from "@/types/accountSettings";
import { formatCooldownTime } from "@/lib/helpers/accountSettings";


export const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-2 sm:px-4 py-3 sm:py-4 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50]";

export function SectionCard({
  title,
  description,
  icon,
  accentClass,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div
        className={[
          "h-0.5 w-full opacity-60",
          accentClass,
        ].join(" ")}
      />

      <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border))] px-2 py-3 sm:px-4 sm:py-4">
        {icon ? (
          <span className="shrink-0 text-[hsl(var(--muted-foreground))]">
            {icon}
          </span>
        ) : null}

        <div>
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {title}
          </h2>

          {description ? (
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="px-2 py-3 sm:px-4 sm:py-4">
        {children}
      </div>
    </section>
  );
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
      {children}
    </span>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
      {message}
    </p>
  );
}

export function InputField({
  label,
  type = "text",
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>

      <input
        type={type}
        {...props}
        className={inputClass}
      />

      <FieldError message={error} />
    </label>
  );
}

export function PasswordField({
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
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <input
          {...props}
          type={
            showPassword
              ? "text"
              : "password"
          }
          className={[
            inputClass,
            "pr-20",
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

      <FieldError message={error} />
    </label>
  );
}

export function CurrentValueChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </span>

      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
        {value}
      </span>
    </div>
  );
}

export function Feedback({
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

export function LoadingSecurityOptions() {
  return (
    <div
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-5 text-center text-sm text-[hsl(var(--muted-foreground))]"
      role="status"
      aria-live="polite"
    >
      Loading account security
      options...
    </div>
  );
}

export function GoogleVerifiedNotice() {
  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
      ✓ Google identity verified. This
      verification is temporary.
    </div>
  );
}

export function GoogleVerificationPrompt({
  onVerify,
  description,
}: {
  onVerify: () => void;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
        {description}
      </div>

      <button
        type="button"
        onClick={onVerify}
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
      >
        Verify with Google
      </button>
    </div>
  );
}

export function VerificationChooser({
  value,
  onPassword,
  onGoogle,
}: {
  value: VerificationMethod;
  onPassword: () => void;
  onGoogle: () => void;
}) {
  if (value !== null) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/20] px-4 py-3">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          Verify your identity to continue.
        </p>

        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Choose the authentication method
          you want to use.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPassword}
          className="cursor-pointer rounded-xl border border-amber-400/40 bg-amber-500/8 px-3 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-300"
        >
          Use Password
        </button>

        <button
          type="button"
          onClick={onGoogle}
          className="cursor-pointer rounded-xl border border-sky-400/40 bg-sky-500/8 px-3 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
        >
          Use Google
        </button>
      </div>
    </div>
  );
}

export function CooldownNotice({
  secondsRemaining,
  label,
}: {
  secondsRemaining: number;
  label: string;
}) {
  if (secondsRemaining <= 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-800 dark:text-amber-300">
      <p className="font-semibold">
        Please wait before trying again
      </p>

      <p className="mt-1">
        For account security, {label} are
        temporarily limited. You can try
        again in{" "}
        <span className="font-semibold">
          {formatCooldownTime(
            secondsRemaining,
          )}
        </span>
        .
      </p>
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
  disabled,
  disabledLabel,
}: {
  children: React.ReactNode;
  pending?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const isDisabled = Boolean(
    pending || disabled,
  );

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
    >
      {pending
        ? "Saving…"
        : disabled &&
            disabledLabel
          ? disabledLabel
          : children}
    </button>
  );
}

export const UserIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="8" cy="5" r="3" />
    <path
      d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
      strokeLinecap="round"
    />
  </svg>
);

export const MailIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect
      x="1.5"
      y="3.5"
      width="13"
      height="9"
      rx="1.5"
    />
    <polyline
      points="1.5,4 8,9 14.5,4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LockIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect
      x="3"
      y="7"
      width="10"
      height="8"
      rx="1.5"
    />
    <path
      d="M5 7V5a3 3 0 0 1 6 0v2"
      strokeLinecap="round"
    />
    <circle
      cx="8"
      cy="11"
      r="1"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);
