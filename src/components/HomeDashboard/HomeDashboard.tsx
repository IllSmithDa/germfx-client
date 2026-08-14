/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/page.tsx (or components/HomeDashboard.tsx)
"use client";

import Link from "next/link";

// import { Insights } from "./Insights"; // (unused here)
import { Insight, SymptomLog, SymptomPoint } from "@/types";
import { UserMedication } from "@/types/userMedication";
import { CLIENT_PATHS } from "@/config/paths";
import MedicationList from "./MedicationList";


// import Navbar from "@/components/Navbar/Navbar"; // uncomment if you want navbar here

export function HomeDashboard({
  medications,
  recentLogs,
}: {
  medications ?: UserMedication[];
  symptomSerie ?: SymptomPoint[]; // kept for parity with your types; not used here
  recentLogs ?: SymptomLog[];
}) {
  /*
  const commonSymptoms = useMemo(() => {
    const freq = new Map<string, number>();
    for (const m of medications) {
      for (const s of m.commonSideEffects ?? []) {
        const key = s.trim().toLowerCase();
        if (!key) continue;
        freq.set(key, (freq.get(key) ?? 0) + 1);
      }
    }
    // sort by frequency desc, then alpha
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([term, count]) => ({ term, count }));
  }, [medications]);
  */
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-[hsl(var(--foreground))]">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GermFx Home (Demo)</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Preview your medications, symptoms, and insights.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={CLIENT_PATHS.addMedicationPath()}
            className="
              rounded-xl px-4 py-2 font-medium
              bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
              hover:opacity-90 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
            "
          >
            Add Medication
          </Link>
          <Link
            href={CLIENT_PATHS.logSymptomsPath()}
            className="
              rounded-xl px-4 py-2 font-medium
              border border-[hsl(var(--border))]
              bg-[hsl(var(--card))] text-[hsl(var(--foreground))]
              hover:opacity-90 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
            "
          >
            Log Symptom
          </Link>
        </div>
      </header>

      {/* Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-6">
          {/* Medications */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Medications</h2>
            <MedicationList medications={medications ?? []} />
          </div>
        </div>
      </section>
    </main>
  );
}
