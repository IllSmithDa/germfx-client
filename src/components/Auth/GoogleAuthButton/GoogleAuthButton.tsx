// src/components/Auth/GoogleAuthButton.tsx

"use client";

type GoogleAuthButtonProps = {
  mode?: "login" | "register";
  disabled?: boolean;
};

export default function GoogleAuthButton({
  mode = "login",
  disabled = true,
}: GoogleAuthButtonProps) {
  const label =
    mode === "register" ? "Continue with Google" : "Sign in with Google";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        console.log("Google OAuth not configured yet.");
      }}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] shadow-sm transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={label}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
        G
      </span>

      <span>{label}</span>

      {disabled ? (
        <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
          Soon
        </span>
      ) : null}
    </button>
  );
}