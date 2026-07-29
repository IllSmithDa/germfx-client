// src/components/Auth/ResetPasswordForm.tsx
"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { resetPasswordClient } from "@/lib/client/resetPasswordApi";

type ResetPasswordFormProps = {
  token: string;
};

type ResetPasswordFormValues = {
  new_password: string;
  confirm_new_password: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

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

function PasswordField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </span>

      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={[inputClass, "pr-20"].join(" ")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-3 inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
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

      {error ? (
        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{error}</p>
      ) : null}
    </label>
  );
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      new_password: "",
      confirm_new_password: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setFeedback({ ok: false, message: "Missing or invalid reset token." });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result = await resetPasswordClient({
        token,
        new_password: values.new_password,
        confirm_new_password: values.confirm_new_password,
      });

      setFeedback({ ok: result.ok, message: result.message });

      if (result.ok) {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <Feedback
          state={{ ok: false, message: "Missing or invalid reset token." }}
        />
        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          <Link
            href="/forgot-password"
            className="font-medium text-[hsl(var(--foreground))] hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <PasswordField
        label="New Password"
        autoComplete="new-password"
        placeholder="Enter your new password"
        error={errors.new_password?.message}
        {...register("new_password", {
          required: "New password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          maxLength: {
            value: 128,
            message: "Password must be 128 characters or fewer",
          },
        })}
      />

      <PasswordField
        label="Confirm New Password"
        autoComplete="new-password"
        placeholder="Confirm your new password"
        error={errors.confirm_new_password?.message}
        {...register("confirm_new_password", {
          required: "Please confirm your new password",
          validate: (value) =>
            value === watch("new_password") || "Passwords do not match",
        })}
      />

      <Feedback state={feedback} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Reset Password"}
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