import Link from "next/link";
import UserMedicationList from "../UserMedicationList/UserMedicationList";
import { UserMedication } from "@/types/userMedication";
import { CLIENT_PATHS } from "@/config/paths";
import CodeLookupBar from "../CodeLookupBar/CodeLookupBar";
import DrugSearchBar from "../DrugSearchBar/DrugSearchBar";
import { redirect } from "next/navigation";

type Props = {
  medications: UserMedication[];
  activeMeds: UserMedication[];
  inactiveMeds: UserMedication[];
};

async function searchDrug(formData: FormData) {
  const q = String(formData.get("q") || "").trim();

  if (!q) {
    return;
  }

  redirect(CLIENT_PATHS.searchResultsPath(q));
}

function CountPill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "active" | "muted";
}) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold leading-none sm:min-h-8 sm:px-3 sm:text-xs",
        tone === "active"
          ? "border-green-400/40 bg-green-500/10 text-green-600 dark:text-green-400"
          : "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function FieldCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:text-xs">
      {children}
    </p>
  );
}

export default function MedicationsPanel({
  medications,
  activeMeds,
  inactiveMeds,
}: Props) {
  return (
    <div
      role="tabpanel"
      className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
    >
      <div className="space-y-3 p-2.5 sm:space-y-4 sm:p-5 ">
        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:rounded-2xl sm:p-5 hidden sm:block">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-2 sm:mb-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-lg sm:leading-6">
                Medication Lookup
              </h2>
              <p className="mt-1 hidden text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:block">
                Search by medication name, UPC, or package NDC.
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 sm:hidden">
              Name / Code
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4 ">
            <div>
              <FieldCaption>Drug name</FieldCaption>
              <DrugSearchBar
                action={searchDrug}
                inputId="med-panel-drug-search"
                placeholder="Tylenol, ibuprofen, lisinopril…"
                buttonText="Search"
                mobileLayout="stacked"
              />
            </div>

            <details className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 sm:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-semibold text-[hsl(var(--foreground))] marker:hidden">
                <span>Search by UPC / NDC</span>
                <svg
                  className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>

              <div className="border-t border-[hsl(var(--border))] px-3 pb-3 pt-2.5">
                <CodeLookupBar
                  inputId="med-panel-code-search-mobile"
                  title="UPC / NDC"
                  descriptionMode="hidden"
                  placeholder="UPC or package NDC"
                  buttonText="Lookup"
                  mobileLayout="stacked"
                />
              </div>
            </details>

            <div className="hidden border-t border-[hsl(var(--border))] pt-4 sm:block">
              <CodeLookupBar
                inputId="med-panel-code-search"
                title="UPC / Package NDC"
                descriptionMode="desktop"
                placeholder="e.g. 0070038610953 or 63941-519-15"
                buttonText="Lookup"
                mobileLayout="inline"
              />
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 p-2.5 sm:rounded-2xl sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 justify-between sm:justify-start">
              <h2 className="truncate text-base font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-lg sm:leading-6">
                My Medications
              </h2>
              {medications.length > 0 ? (
                <>
                  <CountPill tone="active">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                    {activeMeds.length} active
                  </CountPill>

                  {inactiveMeds.length > 0 ? (
                    <CountPill>{inactiveMeds.length} inactive</CountPill>
                  ) : null}
                </>
              ) : (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  No tracked medications yet.
                </span>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <Link
                href={CLIENT_PATHS.userMedicationsPath()}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] sm:min-h-8 sm:py-1.5"
              >
                View all
              </Link>

              <Link
                href={CLIENT_PATHS.drugSearchPage()}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-sky-400 sm:min-h-8 sm:py-1.5"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="8" y1="3" x2="8" y2="13" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                </svg>
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add medication</span>
              </Link>
            </div>
          </div>
        </div>

        <UserMedicationList medications={medications} />
      </div>
    </div>
  );
}