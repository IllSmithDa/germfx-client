// components/CommonSymptoms.tsx
import { UserMedication } from "@/types/userMedication";
import React from "react";

export default function CommonSymptoms({
  medications,
  commonSymptoms,
}: {
  medications: UserMedication[];
  commonSymptoms: { term: string; count: number }[];
}) {
  const isEmpty = medications.length === 0 || commonSymptoms.length === 0;

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Keep semantics without a visible duplicate header */}
      <h3 className="sr-only">Common symptoms</h3>

      {isEmpty ? (
        <div className="p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Add medications to see common side-effects summarized here.
          </p>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.slice(0, 15).map(({ term, count }) => (
              <span
                key={term}
                className="
                  inline-flex items-center gap-1.5
                  rounded-full border border-[hsl(var(--border))]
                  bg-[hsl(var(--accent))] px-2.5 py-1 text-xs
                  text-[hsl(var(--accent-foreground))] shadow-sm
                "
                title={`${count} medication${count > 1 ? "s" : ""} list this`}
              >
                {term}
                {count > 1 && (
                  <span
                    className="
                      inline-block rounded px-1 text-[10px]
                      bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]
                    "
                  >
                    ×{count}
                  </span>
                )}
              </span>
            ))}
          </div>

          {commonSymptoms.length > 15 && (
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              +{commonSymptoms.length - 15} more
            </p>
          )}
        </div>
      )}
    </section>
  );
}
