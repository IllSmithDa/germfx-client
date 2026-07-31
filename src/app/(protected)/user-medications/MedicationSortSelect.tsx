"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";
import { UserMedicationSort } from "@/types/userMedication";

const MEDICATION_SORT_OPTIONS: readonly SortSelectOption<UserMedicationSort>[] = [
  { value: "latest", label: "Latest added" },
  { value: "oldest", label: "Oldest added" },
  { value: "alphabetical", label: "A to Z" },
  { value: "reverse_alphabetical", label: "Z to A" },
];

export default function MedicationSortSelect({
  value = "latest",
}: {
  value?: UserMedicationSort;
}) {
  return (
    <SortSelect<UserMedicationSort>
      value={value}
      options={MEDICATION_SORT_OPTIONS}
      defaultValue="latest"
      basePath="/user-medications"
      ariaLabel="Sort medications"
      variant="toolbar"
      label="Sort medications"
    />
  );
}