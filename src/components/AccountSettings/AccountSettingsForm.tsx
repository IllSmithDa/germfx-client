"use client";

import {
  changeUsernameAction,
} from "@/app/actions/accountActions";
import {
  changeEmailClient,
  changePasswordClient
} from "@/lib/client/accountsClientApi";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type AccountSettingsFormsProps = {
  currentUsername: string;
  currentEmail: string;
};

type ChangeUsernameFormValues = { new_username: string };
type ChangeEmailFormValues = {
  current_password: string;
  new_email: string;
  confirm_new_email: string;
};
type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

type FeedbackState = { ok: boolean; message: string } | null;

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-2 sm:px-4 py-3 sm:py-4 text-sm text-[hsl(var(--foreground))] outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))/50]";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  accentClass = "bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500",
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentClass?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className={["h-0.5 w-full opacity-60", accentClass].join(" ")} />
      <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border))] px-2 sm:px-4 py-3 sm:py-4">
        {icon && (
          <span className="shrink-0 text-[hsl(var(--muted-foreground))]">{icon}</span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
          )}
        </div>
      </div>
      <div className="px-2 sm:px-4 py-3 sm:py-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
      {children}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{message}</p>;
}

function InputField({
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
      <input type={type} {...props} className={inputClass} />
      <FieldError message={error} />
    </label>
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
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={[inputClass, "pr-20"].join(" ")}
        />

        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-3 inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus:outline-non cursor-pointer"
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

function CurrentValueChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
      <span className="text-sm font-medium text-[hsl(var(--foreground))]">{value}</span>
    </div>
  );
}

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null;
  return (
    <div
      className={[
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-400/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-rose-400/40 bg-rose-500/8 text-rose-700 dark:text-rose-400",
      ].join(" ")}
    >
      {state.ok ? (
        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="8" r="6" />
          <polyline points="5,8 7,10 11,6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2L1.5 13.5h13L8 2z" />
          <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
          <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      )}
      <span>{state.message}</span>
    </div>
  );
}

function SubmitButton({
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
  const isDisabled = Boolean(pending || disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
    >
      {pending ? (
        <>
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Saving…
        </>
      ) : disabled && disabledLabel ? (
        disabledLabel
      ) : (
        children
      )}
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="5" r="3" />
    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
    <polyline points="1.5,4 8,9 14.5,4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="7" width="10" height="8" rx="1.5" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
  </svg>
);

type AccountCooldownAction =
  | "change_username"
  | "change_email"
  | "change_password";

const ACCOUNT_COOLDOWN_SECONDS: Record<AccountCooldownAction, number> = {
  change_username: 300,
  change_email: 300,
  change_password: 300,
};

const ACCOUNT_COOLDOWN_LABELS: Record<AccountCooldownAction, string> = {
  change_username: "username changes",
  change_email: "email-change requests",
  change_password: "password changes",
};

function getCooldownStorageKey(action: AccountCooldownAction) {
  return `sidefx_account_settings_cooldown_${action}`;
}

function formatCooldownTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSecondsRemainingFromUntil(cooldownUntil: number) {
  if (!cooldownUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
}

function getCooldownSecondsFromResult(result: unknown) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const value = result as {
    remaining_seconds?: unknown;
    retryAfterSeconds?: unknown;
    retry_after_seconds?: unknown;
  };

  if (typeof value.remaining_seconds === "number") {
    return value.remaining_seconds;
  }

  if (typeof value.retryAfterSeconds === "number") {
    return value.retryAfterSeconds;
  }

  if (typeof value.retry_after_seconds === "number") {
    return value.retry_after_seconds;
  }

  return null;
}

function useAccountActionCooldown(action: AccountCooldownAction) {
  const defaultSeconds = ACCOUNT_COOLDOWN_SECONDS[action];
  const storageKey = getCooldownStorageKey(action);

  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= Date.now()) {
      window.localStorage.removeItem(storageKey);
      setCooldownUntil(0);
      setSecondsRemaining(0);
      return;
    }

    setCooldownUntil(parsedValue);
    setSecondsRemaining(getSecondsRemainingFromUntil(parsedValue));
  }, [storageKey]);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    function updateRemainingTime() {
      const nextSecondsRemaining = getSecondsRemainingFromUntil(cooldownUntil);

      setSecondsRemaining(nextSecondsRemaining);

      if (nextSecondsRemaining <= 0) {
        window.localStorage.removeItem(storageKey);
        setCooldownUntil(0);
      }
    }

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownUntil, storageKey]);

  function start(seconds = defaultSeconds) {
    const safeSeconds = Math.max(1, Math.ceil(seconds));
    const nextCooldownUntil = Date.now() + safeSeconds * 1000;

    window.localStorage.setItem(storageKey, String(nextCooldownUntil));
    setCooldownUntil(nextCooldownUntil);
    setSecondsRemaining(safeSeconds);
  }

  function clear() {
    window.localStorage.removeItem(storageKey);
    setCooldownUntil(0);
    setSecondsRemaining(0);
  }

  return {
    active: secondsRemaining > 0,
    secondsRemaining,
    start,
    clear,
    label: ACCOUNT_COOLDOWN_LABELS[action],
  };
}

function CooldownNotice({
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
      <p className="font-semibold">Please wait before trying again</p>
      <p className="mt-1">
        For account security, {label} are temporarily limited. You can try
        again in{" "}
        <span className="font-semibold">
          {formatCooldownTime(secondsRemaining)}
        </span>
        .
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AccountSettingsForms({
  currentUsername,
  currentEmail,
}: AccountSettingsFormsProps) {
  const [usernameFeedback, setUsernameFeedback] = useState<FeedbackState>(null);
  const [emailFeedback, setEmailFeedback]       = useState<FeedbackState>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);

  const [usernamePending, setUsernamePending] = useState(false);
  const [emailPending, setEmailPending]       = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  
  const usernameCooldown = useAccountActionCooldown("change_username");
  const emailCooldown = useAccountActionCooldown("change_email");
  const passwordCooldown = useAccountActionCooldown("change_password");
  
  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    formState: { errors: usernameErrors },
  } = useForm<ChangeUsernameFormValues>({
    defaultValues: { new_username: currentUsername },
  });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    watch: watchEmail,
    resetField: resetEmailField,
    formState: { errors: emailErrors },
  } = useForm<ChangeEmailFormValues>({
    defaultValues: {
      new_email: currentEmail,
      confirm_new_email: currentEmail,
      current_password: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  async function onSubmitUsername(values: ChangeUsernameFormValues) {
    if (usernameCooldown.active) {
      setUsernameFeedback({
        ok: false,
        message: `Please wait ${formatCooldownTime(
          usernameCooldown.secondsRemaining,
        )} before changing your username again.`,
      });
      return;
    }

    setUsernamePending(true);
    setUsernameFeedback(null);

    try {
      const result = await changeUsernameAction(values);

      if (!result.ok) {
        const cooldownSeconds = getCooldownSecondsFromResult(result);

        if (cooldownSeconds) {
          usernameCooldown.start(cooldownSeconds);
        }

        setUsernameFeedback({
          ok: false,
          message: result.error ?? "Error: username could not be updated",
        });

        return;
      }

      usernameCooldown.start();

      setUsernameFeedback({
        ok: result.ok,
        message: result.message ?? "Username has been successfully updated.",
      });
    } finally {
      setUsernamePending(false);
    }
  }


  async function onSubmitEmail(values: ChangeEmailFormValues) {
    if (emailCooldown.active) {
      setEmailFeedback({
        ok: false,
        message: `Please wait ${formatCooldownTime(
          emailCooldown.secondsRemaining,
        )} before requesting another email change.`,
      });
      return;
    }

    setEmailPending(true);
    setEmailFeedback(null);

    try {
      const result = await changeEmailClient(values);

      const cooldownSeconds = getCooldownSecondsFromResult(result);

      if (!result.ok && cooldownSeconds) {
        emailCooldown.start(cooldownSeconds);
      }

      setEmailFeedback({
        ok: result.ok,
        message: result.ok
          ? result.message ||
            "Verification email sent. Please check your new email address to complete the change."
          : result.message || "Unable to request email change.",
      });

      if (result.ok) {
        emailCooldown.start();
        resetEmailField("current_password");
      }
    } finally {
      setEmailPending(false);
    }
  }

  async function onSubmitPassword(values: ChangePasswordFormValues) {
    if (passwordCooldown.active) {
      setPasswordFeedback({
        ok: false,
        message: `Please wait ${formatCooldownTime(
          passwordCooldown.secondsRemaining,
        )} before changing your password again.`,
      });
      return;
    }
  
    setPasswordPending(true);
    setPasswordFeedback(null);
  
    try {
      const result = await changePasswordClient(values);
    
      const cooldownSeconds = getCooldownSecondsFromResult(result);
    
      if (!result.ok && cooldownSeconds) {
        passwordCooldown.start(cooldownSeconds);
      }
    
      setPasswordFeedback({ ok: result.ok, message: result.message });
    
      if (result.ok) {
        passwordCooldown.start();
        resetPasswordForm();
      
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="grid gap-5">
      <SectionCard
        title="Change Username"
        description="Usernames must be 4–20 characters with no spaces or special characters."
        icon={<UserIcon />}
        accentClass="bg-sky-500/60"
      >
        <form onSubmit={handleSubmitUsername(onSubmitUsername)} className="space-y-4">
          <CurrentValueChip label="Current Username" value={currentUsername} />

          <InputField
            label="New Username"
            placeholder="Enter a new username"
            autoComplete="username"
            error={usernameErrors.new_username?.message}
            {...registerUsername("new_username", {
              required: "Username is required",
              minLength: { value: 4, message: "Must be at least 4 characters" },
              maxLength: { value: 20, message: "Must be 20 characters or fewer" },
            })}
          />

          <Feedback state={usernameFeedback} />

          <CooldownNotice
            secondsRemaining={usernameCooldown.secondsRemaining}
            label={usernameCooldown.label}
          />
                    
          <div className="flex items-center justify-end pt-1">
            <SubmitButton
              pending={usernamePending}
              disabled={usernameCooldown.active}
              disabledLabel={`Try again in ${formatCooldownTime(
                usernameCooldown.secondsRemaining,
              )}`}
            >
              Update Username
            </SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Change Email"
        description="Requires your current password. A verification link will be sent to your new email address." 
        icon={<MailIcon />}
        accentClass="bg-violet-500/60"
      >
        <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
          <CurrentValueChip label="Current Email" value={currentEmail} />
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
              Your email will not change immediately. We will send a verification link to
              your new email address. After you confirm the link, your email will be updated
              and existing sessions may be signed out for security.
            </div>
          <PasswordField
            label="Current Password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            error={emailErrors.current_password?.message}
            {...registerEmail("current_password", {
              required: "Current password is required",
            })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="New Email"
              type="email"
              autoComplete="email"
              placeholder="New email address"
              error={emailErrors.new_email?.message}
              {...registerEmail("new_email", { required: "New email is required" })}
            />
            <InputField
              label="Confirm New Email"
              type="email"
              autoComplete="email"
              placeholder="Confirm new email"
              error={emailErrors.confirm_new_email?.message}
              {...registerEmail("confirm_new_email", {
                required: "Please confirm your new email",
                validate: (v) => v === watchEmail("new_email") || "Emails do not match",
              })}
            />
          </div>

          <Feedback state={emailFeedback} />

          <CooldownNotice
            secondsRemaining={emailCooldown.secondsRemaining}
            label={emailCooldown.label}
          />
                      
          <div className="flex items-center justify-end pt-1">
            <SubmitButton
              pending={emailPending}
              disabled={emailCooldown.active}
              disabledLabel={`Try again in ${formatCooldownTime(
                emailCooldown.secondsRemaining,
              )}`}
            >
              Send Verification Email
            </SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Change Password"
        description="Choose a password between 8 and 128 characters. You will be signed out after changing it."
        icon={<LockIcon />}
        accentClass="bg-rose-500/50"
      >
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          <PasswordField
            label="Current Password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            error={passwordErrors.current_password?.message}
            {...registerPassword("current_password", {
              required: "Current password is required",
            })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              label="New Password"
              autoComplete="new-password"
              placeholder="New password"
              error={passwordErrors.new_password?.message}
              {...registerPassword("new_password", {
                required: "New password is required",
                minLength: { value: 8, message: "Must be at least 8 characters" },
                maxLength: { value: 128, message: "Must be 128 characters or fewer" },
              })}
            />
            <PasswordField
              label="Confirm New Password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              error={passwordErrors.confirm_new_password?.message}
              {...registerPassword("confirm_new_password", {
                required: "Please confirm your new password",
                validate: (v) => v === watchPassword("new_password") || "Passwords do not match",
              })}
            />
          </div>

          <Feedback state={passwordFeedback} />

          <CooldownNotice
            secondsRemaining={passwordCooldown.secondsRemaining}
            label={passwordCooldown.label}
          />
                      
          <div className="flex items-center justify-end pt-1">
            <SubmitButton
              pending={passwordPending}
              disabled={passwordCooldown.active}
              disabledLabel={`Try again in ${formatCooldownTime(
                passwordCooldown.secondsRemaining,
              )}`}
            >
              Update Password
            </SubmitButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}