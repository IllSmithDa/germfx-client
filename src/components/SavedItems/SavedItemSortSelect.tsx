"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";
import { SavedItemsSort } from "@/types";

type ExtraParams = Record<string, string | number | boolean | null | undefined>;

const SAVED_ITEM_SORT_OPTIONS: readonly SortSelectOption<SavedItemsSort>[] = [
  { value: "newest", label: "Newest saved" },
  { value: "oldest", label: "Oldest saved" },
];

export default function SavedItemSortSelect({
  value = "newest",
  baseUrl,
  sortParam,
  pageParam,
  extraParams,
}: {
  value?: SavedItemsSort;
  baseUrl: string;
  sortParam: string;
  pageParam: string;
  extraParams?: ExtraParams;
}) {
  return (
    <SortSelect<SavedItemsSort>
      value={value}
      options={SAVED_ITEM_SORT_OPTIONS}
      defaultValue="newest"
      basePath={baseUrl}
      paramName={sortParam}
      resetPageParam={pageParam}
      extraParams={extraParams}
      ariaLabel="Sort saved items"
      label="Sort saved items"
    />
  );
}