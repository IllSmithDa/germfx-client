import { CLIENT_PATHS } from "@/config/paths";
import Link from "next/link";

export function hasValidUserId(userId?: number | string | null) {
  if (userId === null || userId === undefined) {
    return false;
  }

  return String(userId).trim().length > 0;
}

export function LoginRequiredPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      role="tabpanel"
      className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"
    >
      <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/35 px-5 py-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-500">
          <svg
            className="h-5 w-5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M3 14a5 5 0 0 1 10 0" strokeLinecap="round" />
          </svg>
        </div>

        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {title}
        </h3>

        <p className="mx-auto mt-1 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          {description}
        </p>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={CLIENT_PATHS.clientLoginPath()}
            className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
          >
            Log in
          </Link>

          <Link
            href={CLIENT_PATHS.clientRegisterPath()}
            className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}