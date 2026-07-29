import Link from "next/link";

type Props = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function VerifyEmailErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const reason = params.reason ?? "This verification link is invalid or has expired.";

  return (
    <div className="landing-root min-h-[calc(100vh-57px)]">
      <div className="landing-grid pointer-events-none fixed inset-0" aria-hidden />
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
          className="landing-display mb-10 text-2xl font-bold text-[hsl(var(--landing-fg))] hover:opacity-80 transition-opacity"
        >
          Side<span className="text-[hsl(var(--landing-accent))]">FX</span>.ai
        </Link>

        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(220_20%_16%)] bg-[hsl(220_28%_9%)] shadow-2xl shadow-black/40">
          <div
            className="h-0.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(0 70% 60%), transparent)",
            }}
          />

          <div className="px-8 py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-400">
              <svg className="h-7 w-7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 2L1.5 13.5h13L8 2z" />
                <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
                <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </div>

            <div className="mt-5 text-center">
              <h1 className="landing-display text-2xl font-bold text-[hsl(var(--landing-fg))]">
                Verification failed
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--landing-fg-muted))]">
                We could not verify your email with this link.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-500/8 p-5 text-sm text-rose-200">
              {reason}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/verify-email/resend"
                className="landing-btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
              >
                Resend Verification Email
              </Link>

              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-[hsl(220_20%_20%)] bg-[hsl(220_25%_12%)] px-4 py-3 text-sm font-semibold text-[hsl(var(--landing-fg-muted))] transition hover:border-[hsl(210_80%_62%/0.35)] hover:text-[hsl(var(--landing-fg))]"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}