"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { reactivateAccountClient } from "@/lib/client/reactivationApi";

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

export default function ReactivateAccountForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

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

  async function onSubmit(values: ReactivateAccountFormValues) {
    setPending(true);
    setFeedback(null);

    try {
      const result = await reactivateAccountClient(values);
      setFeedback({ ok: result.ok, message: result.message });

      if (result.ok) {
        setTimeout(() => {
          router.push("/home");
        }, 1200);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="rounded-xl border border-[hsl(210_80%_62%/0.25)] bg-[hsl(210_80%_62%/0.08)] px-4 py-3 text-sm text-[hsl(var(--landing-fg-muted))]">
        Use your email or username and current password to reactivate your account.
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Email or username</FieldLabel>
        <input
          type="text"
          placeholder="you@email.com or username"
          autoComplete="username"
          {...register("identifier", {
            required: "Email or username is required",
            minLength: {
              value: 3,
              message: "Enter your email or username",
            },
          })}
          className={[inputBase, errors.identifier ? inputError : inputNormal].join(" ")}
        />
        <FieldError message={errors.identifier?.message} />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Password</FieldLabel>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 1,
                message: "Password is required",
              },
            })}
            className={[inputBase, "pr-20", errors.password ? inputError : inputNormal].join(" ")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 inline-flex items-center gap-1 text-xs text-[hsl(var(--landing-fg-subtle))] hover:text-[hsl(var(--landing-fg-muted))] transition-colors focus:outline-none"
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
        <FieldError message={errors.password?.message} />
      </div>

      <Feedback state={feedback} />

      <button
        type="submit"
        disabled={pending}
        className="landing-btn-primary w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Reactivating..." : "Reactivate Account"}
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