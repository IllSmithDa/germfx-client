"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";
import { RecallSort } from "@/types/recalls";

const RECALL_SORT_OPTIONS: readonly SortSelectOption<RecallSort>[] = [
  { value: "latest", label: "Latest recalls" },
  { value: "popular", label: "Popular recalls" },
  { value: "oldest", label: "Oldest recalls" },
];

export default function RecallSortSelect({
  value = "latest",
}: {
  value?: RecallSort;
}) {
  return (
    <SortSelect<RecallSort>
      value={value}
      options={RECALL_SORT_OPTIONS}
      defaultValue="latest"
      basePath="/recalls"
      ariaLabel="Sort recalls"
      label="Sort recalls"
    />
  );
}