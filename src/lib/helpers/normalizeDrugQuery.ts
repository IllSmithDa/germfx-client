// src/lib/helpers/normalizeDrugQuery.ts

const STRIP_TERMS = new Set([
  "hydrochloride",
  "sodium",
  "acetate",
  "succinate",
  "tartrate",
  "phosphate",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "injection",
  "solution",
]);

export function normalizeDrugQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s/-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STRIP_TERMS.has(word))
    .join(" ")
    .trim();
}