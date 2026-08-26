// src/components/Auth/GoogleAuthButton.tsx

"use client";

import { API_PROXY_PATHS } from "@/config/paths";

type GoogleAuthButtonProps = {
  mode?: "login" | "register";
  disabled?: boolean;
};

export default function GoogleAuthButton({
  mode = "login",
  disabled = false,
}: GoogleAuthButtonProps) {
  const label =
    mode === "register" ? "Continue with Google" : "Sign in with Google";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;

        // OAuth is a navigation flow. The local Next.js route bridges to
        // FastAPI, which then redirects the browser to Google.
        const loginUrl = new URL(
          API_PROXY_PATHS.googleLogin(),
          window.location.origin,
        );

        loginUrl.searchParams.set(
          "intent",
          mode === "register" ? "register" : "login",
        );

        window.location.assign(loginUrl.toString());
      }}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] shadow-sm transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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