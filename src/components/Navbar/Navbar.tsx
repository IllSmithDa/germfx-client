// components/Navbar/Navbar.tsx
import Link from "next/link";
import Image from "next/image";

/**
 * `variant="landing"` renders a transparent dark navbar for the marketing page.
 * `variant="app"` (default) renders the standard light/dark app navbar.
 */
export default function Navbar() {

  return (
    <nav
      className="sticky top-0 z-40 w-full transition-colors border-b border-[hsl(220_20%_16%)] bg-[hsl(220_30%_6%/0.85)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(220_30%_6%/0.7)]"
      role="navigation"
      aria-label="Main"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-1 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-sky-500/50 "
        >
          <Image
            src="/logo/germfx-logo.png"
            alt="GermFx"
            // width seems to dictate the size of rest of the image. Keep note of this for now
            width={120}
            height={63}
            priority
            className=" spacing-0 "
          />

        </Link>
        <div className="flex items-center gap-4">
        {/* Right */}
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-[hsl(215_18%_62%)] hover:text-[hsl(210_30%_94%)] hover:bg-[hsl(220_20%_14%)]"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 bg-sky-500 text-[hsl(220_30%_6%)] hover:bg-sky-400 hover:shadow-[0_0_18px_hsl(210_80%_62%/0.35)] hover:-translate-y-px"
          >
            Get started
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
              <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
