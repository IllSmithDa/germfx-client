// app/drug-search/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CLIENT_PATHS } from "@/config/paths";
import DrugSearchBar from "@/components/DrugSearchBar/DrugSearchBar";
import CodeLookupBar from "@/components/CodeLookupBar/CodeLookupBar";

export const metadata: Metadata = {
  title: "Drug Search | SideFX",
  description:
    "Search for any medication by brand name, generic, UPC, or package NDC to explore side effects and safety information.",
};

async function searchDrug(formData: FormData) {
  "use server";
  const q = String(formData.get("q") || "").trim();
  if (!q) return;
  redirect(CLIENT_PATHS.searchResultsPath(q));
}

const SUGGESTED_SEARCHES = [
  { label: "Tylenol", type: "brand" },
  { label: "Ibuprofen", type: "generic" },
  { label: "Lisinopril", type: "generic" },
  { label: "Adderall", type: "brand" },
  { label: "Metformin", type: "generic" },
  { label: "Atorvastatin", type: "generic" },
];

const typeColors: Record<string, string> = {
  brand:
    "border-sky-400/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10",
  generic:
    "border-violet-400/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10",
};

export default function DrugSearchPage() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="min-h-[calc(100vh-57px)] mx-auto flex max-w-2xl flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-16">
        {/* Back to home */}
        <div className="mb-2 sm:mb-10 self-start">
          <Link
            href={CLIENT_PATHS.homePath()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline
                points="10,3 4,8 10,13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </Link>
        </div>

        {/* Brand mark + heading */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
            <svg
              className="w-7 h-7 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="7" />
              <line
                x1="16.5"
                y1="16.5"
                x2="21"
                y2="21"
                strokeLinecap="round"
              />
              <line
                x1="11"
                y1="8"
                x2="11"
                y2="14"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="11"
                x2="14"
                y2="11"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl tracking-tight">
            Find a drug
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
            Search by brand name or generic to explore side effects, warnings,
            and dosage information.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full">
          <DrugSearchBar
            action={searchDrug}
            placeholder="e.g. Tylenol, ibuprofen, lisinopril…"
            tipText="Try a brand name like Advil or a generic like acetaminophen."
            buttonText="Search"
          />
        </div>

        {/* Suggested searches */}
        <div className="mt-8 w-full">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Popular searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_SEARCHES.map(({ label, type }) => (
              <Link
                key={label}
                href={CLIENT_PATHS.searchResultsPath(label)}
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
                  typeColors[type] ??
                    "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 sm:mt-12 flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-[hsl(var(--border))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            or
          </span>
          <div className="flex-1 h-px bg-[hsl(var(--border))]" />
        </div>

        {/* Code lookup */}
        <div className="mt-6 w-full">
          <CodeLookupBar
            title="Find by package code"
            description="Enter a UPC or package NDC from the box or bottle."
            placeholder="e.g. 0070038610953 or 63941-519-15"
          />
        </div>

        {/* Disclaimer */}
        <p className="mt-12 flex items-start gap-1.5 text-xs text-[hsl(var(--muted-foreground))] max-w-xs text-center">
          <svg
            className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
            <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          For personal tracking only — not a substitute for medical advice.
        </p>
      </main>
    </div>
  );
}