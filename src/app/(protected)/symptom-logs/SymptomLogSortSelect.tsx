"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";
import { SymptomLogSort } from "@/types/symptomLogs";

const SYMPTOM_LOG_SORT_OPTIONS: readonly SortSelectOption<SymptomLogSort>[] = [
  { value: "latest", label: "Latest logs" },
  { value: "oldest", label: "Oldest logs" },
  { value: "severity_low", label: "Least severe" },
  { value: "severity_high", label: "Most severe" },
];

export default function SymptomLogSortSelect({
  value = "latest",
}: {
  value?: SymptomLogSort;
}) {
  return (
    <SortSelect<SymptomLogSort>
      value={value}
      options={SYMPTOM_LOG_SORT_OPTIONS}
      defaultValue="latest"
      basePath="/symptom-logs"
      ariaLabel="Sort symptom logs"
      label="Sort symptom logs"
    />
  );
}