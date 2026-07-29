import { MedOption } from "@/types";
import { formatDrugName } from "./format_text";

function formatShortDate(date?: string | null): string | null {
  if (!date) return null;

  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;

  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildMedicationDisplayName(m: {
  name?: string | null;
  nickname?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const baseName = formatDrugName(m.name ?? "Medication").trim();
  const nickname = (m.nickname ?? "").trim();

  if (nickname) {
    return `${baseName} (${nickname})`;
  }

  const start = formatShortDate(m.start_date);
  const end = formatShortDate(m.end_date);

  if (start && end) {
    return `${baseName} (${start} → ${end})`;
  }

  if (start) {
    return `${baseName} (${start})`;
  }

  if (end) {
    return `${baseName} (${end})`;
  }

  return baseName;
}

export default function buildUniqueMedOptions(
  medications: Array<{
    id: number | string;
    name?: string | null;
    nickname?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }>
): MedOption[] {
  const seen = new Set<string>();

  return medications
    .map((m) => ({
      id: Number(m.id),
      name: buildMedicationDisplayName(m),
      nickname: m.nickname?.trim() || null,
    }))
    .filter((m) => Number.isFinite(m.id))
    .filter((m) => {
      const key = m.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}