"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";

type RecallTypeFilterValue = "all" | "food" | "drug";

const RECALL_TYPE_OPTIONS: readonly SortSelectOption<RecallTypeFilterValue>[] = [
  { value: "all", label: "All types" },
  { value: "food", label: "Food" },
  { value: "drug", label: "Medication" },
];

export default function RecallTypeFilter({
  value = "all",
}: {
  value?: string;
}) {
  return (
    <SortSelect<RecallTypeFilterValue>
      value={(value || "all") as RecallTypeFilterValue}
      options={RECALL_TYPE_OPTIONS}
      defaultValue="all"
      deleteParamOnDefault={false}
      basePath="/recalls"
      paramName="source"
      ariaLabel="Filter recalls by type"
      label="Filter recalls by type"
      icon="filter"
    />
  );
}